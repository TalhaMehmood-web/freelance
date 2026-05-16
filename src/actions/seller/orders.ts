"use server"

import { requireAuth } from "@/lib/server/auth"
import { prisma } from "@/lib/server/prisma"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"
import type { SellerOrderRow, GetOrdersQuery, OrderStatusCounts } from "@/types/seller"

const PAGE_SIZE = 10

export async function getOrders(
  query: GetOrdersQuery = {}
): Promise<ActionResult<{ orders: SellerOrderRow[]; total: number; pageCount: number }>> {
  const session = await requireAuth(UserRole.Seller)

  const { status, search, page = 1, sortBy = "createdAt", sortDir = "desc" } = query

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { freelancerId: session.userId }

  if (status) where.status = status

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { client: { fullName: { contains: search, mode: "insensitive" } } },
    ]
  }

  const orderBy = { [sortBy]: sortDir }

  const [rawOrders, total] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.order.findMany as any)({
      where,
      orderBy,
      skip:    (page - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
      select: {
        id:          true,
        title:       true,
        status:      true,
        priceCents:  true,
        dueAt:       true,
        createdAt:   true,
        client: {
          select: { fullName: true, avatarUrl: true },
        },
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.order.count as any)({ where }),
  ])

  const orders: SellerOrderRow[] = rawOrders.map((o: {
    id: string; title: string; status: string; priceCents: number
    dueAt: Date | null; createdAt: Date
    client: { fullName: string; avatarUrl: string | null }
  }) => ({
    id:          o.id,
    title:       o.title,
    buyerName:   o.client.fullName,
    buyerAvatar: o.client.avatarUrl,
    status:      o.status,
    amountCents: o.priceCents,
    dueAt:       o.dueAt?.toISOString() ?? o.createdAt.toISOString(),
    createdAt:   o.createdAt.toISOString(),
  }))

  return {
    success: true,
    data: { orders, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) },
  }
}

export async function getOrderStatusCounts(): Promise<ActionResult<OrderStatusCounts>> {
  const session = await requireAuth(UserRole.Seller)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = await (prisma.order.groupBy as any)({
    by:    ["status"],
    where: { freelancerId: session.userId },
    _count: { _all: true },
  })

  const counts: Record<string, number> = {}
  for (const g of groups as { status: string; _count: { _all: number } }[]) {
    counts[g.status] = g._count._all
  }

  return {
    success: true,
    data: {
      active:      counts.active      ?? 0,
      in_revision: counts.in_revision ?? 0,
      delivered:   counts.delivered   ?? 0,
      completed:   counts.completed   ?? 0,
      cancelled:   counts.cancelled   ?? 0,
    },
  }
}
