"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server/supabase"
import { prisma } from "@/lib/server/prisma"
import { LoginSchema, RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/shared/validations"
import { slugify } from "@/lib/shared/utils"
import { UserRole, ActiveRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"

export async function signIn(data: {
  email: string
  password: string
}): Promise<ActionResult<null>> {
  const parsed = LoginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createSupabaseServerClient()
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !authData.user) {
    return { success: false, error: "Invalid email or password." }
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: authData.user.id },
    select: { roles: true },
  })

  const cookieStore = await cookies()
  if (profile?.roles.includes(UserRole.Admin)) {
    cookieStore.set("__admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === "production",
    })
    redirect("/admin/dashboard")
  }

  redirect("/dashboard")
}

export async function signUp(data: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}): Promise<ActionResult<null>> {
  const parsed = RegisterSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createSupabaseServerClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  })
  if (error || !authData.user) {
    if (error?.message.includes("already registered")) {
      return { success: false, error: "An account with this email already exists." }
    }
    return { success: false, error: "Something went wrong. Please try again." }
  }

  await prisma.profile.upsert({
    where: { userId: authData.user.id },
    update: {},
    create: {
      userId: authData.user.id,
      fullName: parsed.data.fullName,
      username: slugify(parsed.data.fullName) + "-" + authData.user.id.slice(0, 6),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set("__role", ActiveRole.Buyer, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  redirect(`/${ActiveRole.Buyer}/dashboard`)
}

export async function forgotPassword(data: {
  email: string
}): Promise<ActionResult<null>> {
  const parsed = ForgotPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })
  if (error) {
    return { success: false, error: "Failed to send reset email. Please try again." }
  }

  return { success: true, data: null }
}

export async function resetPassword(data: {
  password: string
  confirmPassword: string
}): Promise<ActionResult<null>> {
  const parsed = ResetPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return { success: false, error: "Failed to update password. Your link may have expired." }
  }

  redirect("/login?reset=success")
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete("__role")
  cookieStore.delete("__admin")
  redirect("/login")
}
