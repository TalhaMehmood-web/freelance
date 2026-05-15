"use server"

import { requireAuth } from "@/lib/server/auth"
import type { ActionResult } from "@/types/shared"

export interface SellerOrderRow {
  id:          string
  title:       string
  buyerName:   string
  buyerAvatar: string | null
  status:      string
  amountCents: number
  dueAt:       string
  createdAt:   string
}

export interface GetOrdersQuery {
  status?:  string
  search?:  string
  page?:    number
  sortBy?:  "dueAt" | "createdAt" | "amountCents"
  sortDir?: "asc" | "desc"
}

const MOCK_ORDERS: SellerOrderRow[] = [
  { id: "ord_1", title: "Next.js SaaS Application",   buyerName: "Alice Johnson", buyerAvatar: null, status: "active",     amountCents: 99900, dueAt: "2025-05-20T00:00:00Z", createdAt: "2025-05-10T00:00:00Z" },
  { id: "ord_2", title: "React Dashboard UI",          buyerName: "Bob Smith",     buyerAvatar: null, status: "in_revision", amountCents: 49900, dueAt: "2025-05-18T00:00:00Z", createdAt: "2025-05-08T00:00:00Z" },
  { id: "ord_3", title: "Next.js SaaS Application",   buyerName: "Carol White",   buyerAvatar: null, status: "delivered",  amountCents: 99900, dueAt: "2025-05-15T00:00:00Z", createdAt: "2025-05-01T00:00:00Z" },
  { id: "ord_4", title: "TypeScript API Backend",     buyerName: "David Lee",     buyerAvatar: null, status: "completed",  amountCents: 79900, dueAt: "2025-05-10T00:00:00Z", createdAt: "2025-04-28T00:00:00Z" },
  { id: "ord_5", title: "React Dashboard UI",          buyerName: "Emma Davis",    buyerAvatar: null, status: "active",     amountCents: 49900, dueAt: "2025-05-22T00:00:00Z", createdAt: "2025-05-11T00:00:00Z" },
  { id: "ord_6", title: "Next.js SaaS Application",   buyerName: "Frank Miller",  buyerAvatar: null, status: "cancelled",  amountCents: 99900, dueAt: "2025-04-30T00:00:00Z", createdAt: "2025-04-20T00:00:00Z" },
  { id: "ord_7", title: "TypeScript API Backend",     buyerName: "Grace Kim",     buyerAvatar: null, status: "completed",  amountCents: 79900, dueAt: "2025-04-25T00:00:00Z", createdAt: "2025-04-15T00:00:00Z" },
  { id: "ord_8", title: "React Dashboard UI",          buyerName: "Henry Park",    buyerAvatar: null, status: "active",     amountCents: 49900, dueAt: "2025-05-25T00:00:00Z", createdAt: "2025-05-12T00:00:00Z" },
]

// MOCK Phase 2 — replace with prisma.order.findMany in Phase 3
export async function getOrders(
  query: GetOrdersQuery = {}
): Promise<ActionResult<{ orders: SellerOrderRow[]; total: number; pageCount: number }>> {
  await requireAuth("seller")

  const { status, search, page = 1, sortBy = "createdAt", sortDir = "desc" } = query
  const pageSize = 10

  let filtered = [...MOCK_ORDERS]
  if (status) filtered = filtered.filter(o => o.status === status)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(o => o.title.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q))
  }

  filtered.sort((a, b) => {
    const av = a[sortBy] as string ?? ""
    const bv = b[sortBy] as string ?? ""
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  const total     = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const orders    = filtered.slice((page - 1) * pageSize, page * pageSize)

  return { success: true, data: { orders, total, pageCount } }
}

export interface OrderStatusCounts {
  active:      number
  in_revision: number
  delivered:   number
  completed:   number
  cancelled:   number
}

// MOCK Phase 2
export async function getOrderStatusCounts(): Promise<ActionResult<OrderStatusCounts>> {
  await requireAuth("seller")
  return {
    success: true,
    data: {
      active:      MOCK_ORDERS.filter(o => o.status === "active").length,
      in_revision: MOCK_ORDERS.filter(o => o.status === "in_revision").length,
      delivered:   MOCK_ORDERS.filter(o => o.status === "delivered").length,
      completed:   MOCK_ORDERS.filter(o => o.status === "completed").length,
      cancelled:   MOCK_ORDERS.filter(o => o.status === "cancelled").length,
    },
  }
}
