import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/server/supabase"
import { prisma } from "@/lib/server/prisma"
import { ActiveRole } from "@/lib/shared/constants"

const ACTIVE_ROLE_VALUES = Object.values(ActiveRole) as [ActiveRole, ...ActiveRole[]]
const SwitchRoleSchema = z.object({
  role: z.enum(ACTIVE_ROLE_VALUES),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = SwitchRoleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const { role } = parsed.data

  if (role === ActiveRole.Seller) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!sellerProfile) {
      return NextResponse.json({ error: "No seller profile", redirect: "/seller-setup/step-1" }, { status: 403 })
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("__role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  })

  return NextResponse.json({ ok: true, role })
}
