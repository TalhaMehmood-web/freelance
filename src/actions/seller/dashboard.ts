"use server"

import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"
import type { DashboardData } from "@/types/seller"


// MOCK Phase 2 — replace with real Prisma queries in Phase 3
export async function getDashboardData(): Promise<ActionResult<DashboardData>> {
  await requireAuth(UserRole.Seller)

  return {
    success: true,
    data: {
      stats: {
        totalEarningsCents:   428500,
        earningsTrendPct:     12.4,
        activeOrders:         3,
        impressionsThisMonth: 1840,
        avgRating:            4.9,
        reviewCount:          23,
      },
      recentOrders: [
        { id: "ord_1", title: "Next.js SaaS Application", buyerName: "Alice Johnson", buyerAvatar: null, status: "active",    amountCents: 99900, dueAt: "2025-05-20T00:00:00Z" },
        { id: "ord_2", title: "React Dashboard UI",       buyerName: "Bob Smith",     buyerAvatar: null, status: "in_revision", amountCents: 49900, dueAt: "2025-05-18T00:00:00Z" },
        { id: "ord_3", title: "Next.js SaaS Application", buyerName: "Carol White",   buyerAvatar: null, status: "delivered",  amountCents: 99900, dueAt: "2025-05-15T00:00:00Z" },
        { id: "ord_4", title: "TypeScript API Backend",   buyerName: "David Lee",     buyerAvatar: null, status: "completed",  amountCents: 79900, dueAt: "2025-05-10T00:00:00Z" },
        { id: "ord_5", title: "React Dashboard UI",       buyerName: "Emma Davis",    buyerAvatar: null, status: "active",    amountCents: 49900, dueAt: "2025-05-22T00:00:00Z" },
      ],
      topGigs: [
        { id: "gig_1", title: "I will build a production-ready Next.js SaaS application", coverImageUrl: null, totalOrders: 12, earningsCents: 259800, avgRating: 4.9 },
        { id: "gig_2", title: "I will create a stunning React dashboard UI",               coverImageUrl: null, totalOrders: 4,  earningsCents: 99600,  avgRating: 4.7 },
        { id: "gig_3", title: "I will develop a TypeScript REST API",                      coverImageUrl: null, totalOrders: 0,  earningsCents: 0,      avgRating: 0   },
      ],
    },
  }
}
