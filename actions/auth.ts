"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server/supabase"
import { prisma } from "@/lib/server/prisma"
import { LoginSchema, RegisterSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/shared/validations"
import { slugify } from "@/lib/shared/utils"
import type { ActionResult } from "@/lib/shared/types"

export async function signIn(_prev: unknown, formData: FormData): Promise<ActionResult<null>> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return { success: false, error: "Invalid email or password." }
  }

  redirect("/dashboard")
}

export async function signUp(_prev: unknown, formData: FormData): Promise<ActionResult<null>> {
  const parsed = RegisterSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on" ? true : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  })
  if (error || !data.user) {
    if (error?.message.includes("already registered")) {
      return { success: false, error: "An account with this email already exists." }
    }
    return { success: false, error: "Something went wrong. Please try again." }
  }

  await prisma.profile.upsert({
    where: { userId: data.user.id },
    update: {},
    create: {
      userId: data.user.id,
      fullName: parsed.data.fullName,
      username: slugify(parsed.data.fullName) + "-" + data.user.id.slice(0, 6),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set("__role", "buyer", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  redirect("/buyer/dashboard")
}

export async function forgotPassword(_prev: unknown, formData: FormData): Promise<ActionResult<null>> {
  const parsed = ForgotPasswordSchema.safeParse({ email: formData.get("email") })
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

export async function resetPassword(_prev: unknown, formData: FormData): Promise<ActionResult<null>> {
  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
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
  redirect("/login")
}
