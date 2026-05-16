import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

// POST /api/admin/users/[id]/roles — assign a role
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { id: targetUserId } = await params
  const { roleSlug }: { roleSlug: string } = await req.json()

  const roleExists = await prisma.role.findUnique({ where: { slug: roleSlug } })
  if (!roleExists) return NextResponse.json({ error: `Role "${roleSlug}" does not exist.` }, { status: 400 })

  const profile = await prisma.profile.findUnique({ where: { userId: targetUserId } })
  if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 })

  if (!profile.roles.includes(roleSlug)) {
    await prisma.profile.update({
      where: { userId: targetUserId },
      data:  { roles: { push: roleSlug } },
    })
  }

  return NextResponse.json({ success: true })
}
