"use server"

import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"

export interface EarningsStats {
  availableBalanceCents: number
  pendingClearanceCents: number
  totalEarnedCents:      number
  thisMonthCents:        number
}

export interface LedgerRow {
  id:          string
  type:        string
  description: string
  orderId:     string | null
  amountCents: number
  status:      string
  createdAt:   string
}

export interface GetLedgerQuery {
  type?:    string
  page?:    number
  sortDir?: "asc" | "desc"
}

const MOCK_LEDGER: LedgerRow[] = [
  { id: "led_1",  type: "order_credit", description: "Order completed — Next.js SaaS",    orderId: "ord_4",  amountCents:  79920, status: "cleared",    createdAt: "2025-05-10T00:00:00Z" },
  { id: "led_2",  type: "order_credit", description: "Order completed — TypeScript API",   orderId: "ord_7",  amountCents:  63920, status: "cleared",    createdAt: "2025-04-26T00:00:00Z" },
  { id: "led_3",  type: "order_credit", description: "Order completed — Next.js SaaS",    orderId: "ord_3",  amountCents:  79920, status: "pending",    createdAt: "2025-05-16T00:00:00Z" },
  { id: "led_4",  type: "withdrawal",   description: "Withdrawal to bank account",          orderId: null,    amountCents: -50000, status: "cleared",    createdAt: "2025-05-01T00:00:00Z" },
  { id: "led_5",  type: "order_credit", description: "Order completed — React Dashboard",  orderId: "ord_2",  amountCents:  39920, status: "pending",    createdAt: "2025-05-14T00:00:00Z" },
  { id: "led_6",  type: "refund",       description: "Refund issued — cancelled order",    orderId: "ord_6",  amountCents: -79920, status: "cleared",    createdAt: "2025-04-21T00:00:00Z" },
  { id: "led_7",  type: "order_credit", description: "Order completed — Next.js SaaS",    orderId: "ord_1",  amountCents:  79920, status: "pending",    createdAt: "2025-05-08T00:00:00Z" },
  { id: "led_8",  type: "withdrawal",   description: "Withdrawal to bank account",          orderId: null,    amountCents: -30000, status: "processing", createdAt: "2025-04-15T00:00:00Z" },
  { id: "led_9",  type: "adjustment",   description: "Platform fee correction",             orderId: null,    amountCents:    500, status: "cleared",    createdAt: "2025-04-10T00:00:00Z" },
  { id: "led_10", type: "order_credit", description: "Order completed — React Dashboard",  orderId: "ord_5",  amountCents:  39920, status: "pending",    createdAt: "2025-05-12T00:00:00Z" },
]

// MOCK Phase 2
export async function getEarningsStats(): Promise<ActionResult<EarningsStats>> {
  await requireAuth(UserRole.Seller)
  return {
    success: true,
    data: {
      availableBalanceCents: 184180,
      pendingClearanceCents:  99680,
      totalEarnedCents:      428500,
      thisMonthCents:        119840,
    },
  }
}

// MOCK Phase 2
export async function getLedger(
  query: GetLedgerQuery = {}
): Promise<ActionResult<{ entries: LedgerRow[]; total: number; pageCount: number }>> {
  await requireAuth(UserRole.Seller)

  const { type, page = 1, sortDir = "desc" } = query
  const pageSize = 10

  let filtered = [...MOCK_LEDGER]
  if (type) filtered = filtered.filter(e => e.type === type)

  filtered.sort((a, b) =>
    sortDir === "asc"
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
  )

  const total     = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const entries   = filtered.slice((page - 1) * pageSize, page * pageSize)

  return { success: true, data: { entries, total, pageCount } }
}
