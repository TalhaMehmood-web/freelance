import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { createUserNotification } from "@/lib/server/notifications"
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const DeliverSchema = z.object({
  message:     z.string().min(1, "Message is required").max(5000),
  attachments: z.array(z.string().url()).default([]),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response

  const { orderId } = await params

  const body = await req.json().catch(() => null)
  const parsed = DeliverSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const order = await db.order.findUnique({
    where:  { id: orderId, freelancerId: auth.session.userId },
    select: { id: true, status: true, clientId: true, title: true, revisionsUsed: true },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (order.status !== "active" && order.status !== "in_revision") {
    return NextResponse.json(
      { error: "Order must be active or in revision to deliver" },
      { status: 422 },
    )
  }

  const isRevision = order.status === "in_revision"

  await db.$transaction([
    db.orderDelivery.create({
      data: {
        orderId,
        message:     parsed.data.message,
        attachments: parsed.data.attachments,
      },
    }),
    db.order.update({
      where: { id: orderId },
      data:  {
        status:       "delivered",
        deliveredAt:  new Date(),
        revisionsUsed: isRevision ? { increment: 1 } : undefined,
      },
    }),
  ])

  await createUserNotification(order.clientId, {
    type:  "order_update",
    title: isRevision ? "Revised Delivery" : "Order Delivered",
    body:  isRevision
      ? `Your order "${order.title}" has been re-delivered after revision.`
      : `Your order "${order.title}" has been delivered. Please review and accept or request changes.`,
    data:  { orderId },
  })

  return NextResponse.json({ success: true })
}
