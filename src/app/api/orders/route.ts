import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { prisma } from "@/lib/server/prisma"
import { STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/shared/constants"

const CreateOrderSchema = z.object({
  gigId:        z.string().min(1),
  packageId:    z.string().min(1),
  requirements: z.string().max(2000).optional().default(""),
})

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 })
  }

  const { gigId, packageId, requirements } = parsed.data

  const gig = await prisma.gig.findUnique({
    where:   { id: gigId },
    include: {
      sellerProfile: { select: { userId: true } },
      packages:      { where: { id: packageId, isActive: true } },
    },
  })

  if (!gig || gig.status !== "active") {
    return NextResponse.json({ error: "Gig not found or not available." }, { status: 404 })
  }

  const pkg = gig.packages[0]
  if (!pkg) {
    return NextResponse.json({ error: "Package not found or not available." }, { status: 404 })
  }

  if (session.userId === gig.sellerProfile.userId) {
    return NextResponse.json({ error: "You cannot purchase your own gig." }, { status: 403 })
  }

  const priceCents            = pkg.priceCents
  const platformFeeCents      = Math.floor(priceCents * (STRIPE_PLATFORM_FEE_PERCENT / 100))
  const freelancerPayoutCents = priceCents - platformFeeCents

  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + pkg.deliveryDays)

  const order = await prisma.order.create({
    data: {
      gigId,
      packageId,
      clientId:             session.userId,
      freelancerId:         gig.sellerProfile.userId,
      title:                gig.title,
      requirements:         requirements || null,
      priceCents,
      platformFeeCents,
      freelancerPayoutCents,
      deliveryDays:         pkg.deliveryDays,
      revisionsAllowed:     pkg.revisions >= 99 ? 999 : pkg.revisions,
      status:               "pending",
      dueAt,
    },
  })

  // Auto-create an order conversation between buyer and seller
  await prisma.conversation.create({
    data: {
      type:    "order",
      orderId: order.id,
      lastMessageAt: requirements ? new Date() : null,
      participants: {
        create: [
          { userId: session.userId },
          { userId: gig.sellerProfile.userId },
        ],
      },
      ...(requirements
        ? {
            messages: {
              create: {
                senderId: session.userId,
                content:  requirements,
                type:     "text",
              },
            },
          }
        : {}),
    },
  })

  return NextResponse.json({ orderId: order.id }, { status: 201 })
}
