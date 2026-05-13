"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/server/supabase"
import { prisma } from "@/lib/server/prisma"
import { z } from "zod"

const Schema = z.object({ role: z.enum(["buyer", "seller"]) })

export async function switchRole(formData: FormData) {
  const parsed = Schema.safeParse({ role: formData.get("role") })
  if (!parsed.success) return

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { role } = parsed.data

  if (role === "seller") {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!profile) redirect("/seller-setup/step-1")
  }

  const cookieStore = await cookies()
  cookieStore.set("__role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  redirect(`/${role}/dashboard`)
}
