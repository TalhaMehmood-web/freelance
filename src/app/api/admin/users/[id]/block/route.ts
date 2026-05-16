import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { blockUser, unblockUser } from "@/actions/admin/users"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const action = body?.action as string | undefined

  if (action !== "block" && action !== "unblock") {
    return NextResponse.json({ error: "Invalid action. Use 'block' or 'unblock'." }, { status: 400 })
  }

  const result = action === "block" ? await blockUser(id) : await unblockUser(id)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, isBlocked: action === "block" })
}
