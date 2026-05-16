import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { id } = await params
  const existing = await db.permissionResource.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Resource not found." }, { status: 404 })

  await db.permissionResource.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
