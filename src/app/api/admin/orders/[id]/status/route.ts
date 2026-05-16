import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

const ALLOWED_STATUSES = ["cancelled", "completed", "pending", "active"] as const
type AllowedStatus = typeof ALLOWED_STATUSES[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const { id } = await params
  const body   = await req.json().catch(() => null)
  const status = body?.status as string | undefined

  if (!status || !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  const now = new Date()
  await prisma.order.update({
    where: { id },
    data: {
      status:      status as AllowedStatus,
      ...(status === "completed" ? { completedAt: now } : {}),
      ...(status === "cancelled" ? { cancelledAt: now } : {}),
    },
  })

  return NextResponse.json({ success: true, status })
}
