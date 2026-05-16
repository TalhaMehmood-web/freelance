import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { deleteRole } from "@/actions/admin/permissions"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session
  try {
    session = await requireAuth(UserRole.Admin)
    await requireSuperAdmin(session)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const result = await deleteRole(id)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
