import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole, ActiveRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const role    = (searchParams.get("role") ?? ActiveRole.Buyer) as ActiveRole
  const status  = searchParams.get("status") ?? ""
  const page    = Math.max(1, Number(searchParams.get("page"))    || 1)
  const perPage = Math.min(50,  Number(searchParams.get("perPage")) || 20)

  type Where = NonNullable<Parameters<typeof prisma.order.findMany>[0]>["where"]
  const where: Where = {
    ...(role === ActiveRole.Buyer  ? { clientId:     id } : {}),
    ...(role === ActiveRole.Seller ? { freelancerId: id } : {}),
    ...(status ? { status: status as any } : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        client:     { select: { username: true, fullName: true, avatarUrl: true } },
        freelancer: { select: { username: true, fullName: true, avatarUrl: true } },
        gig:        { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    prisma.order.count({ where }),
  ])

  const data = orders.map(o => ({
    id:          o.id,
    title:       o.title,
    status:      o.status,
    priceCents:  o.priceCents,
    createdAt:   o.createdAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    cancelledAt: o.cancelledAt?.toISOString() ?? null,
    gigTitle:    o.gig?.title ?? null,
    gigSlug:     o.gig?.slug  ?? null,
    client: {
      username:  o.client.username,
      fullName:  o.client.fullName,
      avatarUrl: o.client.avatarUrl ?? null,
    },
    freelancer: {
      username:  o.freelancer.username,
      fullName:  o.freelancer.fullName,
      avatarUrl: o.freelancer.avatarUrl ?? null,
    },
  }))

  return NextResponse.json({ data, total, pageCount: Math.max(1, Math.ceil(total / perPage)), page, perPage })
}
