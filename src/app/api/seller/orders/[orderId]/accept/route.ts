import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { createUserNotification } from "@/lib/server/notifications"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response

  const { orderId } = await params

  const order = await db.order.findUnique({
    where:  { id: orderId, freelancerId: auth.session.userId },
    select: { id: true, status: true, clientId: true, title: true },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Order must be in pending status to accept" },
      { status: 422 },
    )
  }

  await db.order.update({
    where: { id: orderId },
    data:  { status: "active", startedAt: new Date() },
  })

  await createUserNotification(order.clientId, {
    type:  "order_update",
    title: "Order Started",
    body:  `Your order "${order.title}" has been accepted and work has started.`,
    data:  { orderId },
  })

  return NextResponse.json({ success: true })
}
