import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@/lib/server/supabase"
import { prisma } from "@/lib/server/prisma"

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const {
    professionalTitle,
    country,
    skillNames = [],
  } = body as { professionalTitle?: string; country?: string; skillNames?: string[] }

  // Get display name from profile
  const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { fullName: true } })

  // skills stored as JSON array on SellerProfile
  await prisma.sellerProfile.create({
    data: {
      userId: user.id,
      displayName: profile?.fullName ?? "",
      professionalTitle: professionalTitle ?? "",
      country: country ?? "",
      skills: skillNames,
    },
  })

  // Grant seller role in profile.roles array
  await prisma.profile.update({
    where: { userId: user.id },
    data: { roles: { push: "seller" } },
  })

  const cookieStore = await cookies()
  cookieStore.set("__role", "seller", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  return NextResponse.json({ ok: true })
}
