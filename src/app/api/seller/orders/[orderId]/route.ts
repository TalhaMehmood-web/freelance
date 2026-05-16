import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import type { OrderDetail } from "@/types/orders"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response

  const { orderId } = await params

  const order = await db.order.findUnique({
    where: { id: orderId, freelancerId: auth.session.userId },
    select: {
      id:                    true,
      title:                 true,
      description:           true,
      requirements:          true,
      status:                true,
      priceCents:            true,
      platformFeeCents:      true,
      freelancerPayoutCents: true,
      deliveryDays:          true,
      revisionsAllowed:      true,
      revisionsUsed:         true,
      dueAt:                 true,
      startedAt:             true,
      deliveredAt:           true,
      completedAt:           true,
      cancelledAt:           true,
      createdAt:             true,
      client: {
        select: { userId: true, fullName: true, avatarUrl: true, username: true },
      },
      gig: {
        select: { title: true, slug: true },
      },
      deliveries: {
        orderBy: { createdAt: "asc" },
        select: { id: true, message: true, attachments: true, createdAt: true },
      },
      conversation: {
        select: { id: true },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const detail: OrderDetail = {
    id:                    order.id,
    title:                 order.title,
    description:           order.description,
    requirements:          order.requirements,
    status:                order.status,
    priceCents:            order.priceCents,
    platformFeeCents:      order.platformFeeCents,
    freelancerPayoutCents: order.freelancerPayoutCents,
    deliveryDays:          order.deliveryDays,
    revisionsAllowed:      order.revisionsAllowed,
    revisionsUsed:         order.revisionsUsed,
    dueAt:                 order.dueAt?.toISOString() ?? null,
    startedAt:             order.startedAt?.toISOString() ?? null,
    deliveredAt:           order.deliveredAt?.toISOString() ?? null,
    completedAt:           order.completedAt?.toISOString() ?? null,
    cancelledAt:           order.cancelledAt?.toISOString() ?? null,
    createdAt:             order.createdAt.toISOString(),
    buyer: {
      userId:    order.client.userId,
      fullName:  order.client.fullName,
      avatarUrl: order.client.avatarUrl,
      username:  order.client.username,
    },
    gig:           order.gig ?? null,
    deliveries:    order.deliveries.map((d: {
      id: string; message: string | null; attachments: unknown; createdAt: Date
    }) => ({
      id:          d.id,
      message:     d.message,
      attachments: (d.attachments as string[]) ?? [],
      createdAt:   d.createdAt.toISOString(),
    })),
    conversationId: order.conversation?.id ?? null,
  }

  return NextResponse.json(detail)
}
