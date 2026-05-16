import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { hasPermission } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  if (!(await hasPermission(session, "users:update"))) {
    return NextResponse.json({ error: "You do not have permission to manage users." }, { status: 403 })
  }

  const { id: targetUserId } = await params
  const body = await req.json().catch(() => null)
  const action = body?.action as string | undefined

  if (action !== "block" && action !== "unblock") {
    return NextResponse.json({ error: "Invalid action. Use 'block' or 'unblock'." }, { status: 400 })
  }

  if (action === "block" && session.userId === targetUserId) {
    return NextResponse.json({ error: "You cannot block your own account." }, { status: 400 })
  }

  if (action === "block") {
    await prisma.profile.update({
      where: { userId: targetUserId },
      data:  { isBlocked: true, blockedAt: new Date(), blockedBy: session.userId },
    })
  } else {
    await prisma.profile.update({
      where: { userId: targetUserId },
      data:  { isBlocked: false, blockedAt: null, blockedBy: null },
    })
  }

  return NextResponse.json({ success: true, isBlocked: action === "block" })
}
