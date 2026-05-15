"use server"

import { requireAuth } from "@/lib/server/auth"
import type { ActionResult } from "@/types/shared"

export interface AnalyticsStats {
  totalImpressions: number
  totalClicks:      number
  ctrPercent:       number
  conversionPercent: number
}

export interface GigAnalyticsRow {
  gigId:        string
  title:        string
  impressions:  number
  clicks:       number
  ctrPercent:   number
  orders:       number
  revenueCents: number
}

export interface AnalyticsData {
  stats:         AnalyticsStats
  gigBreakdown:  GigAnalyticsRow[]
}

const MOCK_BY_RANGE: Record<string, AnalyticsData> = {
  "7": {
    stats: { totalImpressions: 320, totalClicks: 44, ctrPercent: 13.8, conversionPercent: 2.2 },
    gigBreakdown: [
      { gigId: "gig_1", title: "I will build a production-ready Next.js SaaS application", impressions: 210, clicks: 30, ctrPercent: 14.3, orders: 2, revenueCents: 199800 },
      { gigId: "gig_2", title: "I will create a stunning React dashboard UI",               impressions:  87, clicks: 11, ctrPercent: 12.6, orders: 1, revenueCents:  49900 },
      { gigId: "gig_3", title: "I will develop a TypeScript REST API",                      impressions:  23, clicks:  3, ctrPercent: 13.0, orders: 0, revenueCents:      0 },
    ],
  },
  "30": {
    stats: { totalImpressions: 1240, totalClicks: 158, ctrPercent: 12.7, conversionPercent: 1.9 },
    gigBreakdown: [
      { gigId: "gig_1", title: "I will build a production-ready Next.js SaaS application", impressions: 820, clicks: 105, ctrPercent: 12.8, orders: 7, revenueCents: 699300 },
      { gigId: "gig_2", title: "I will create a stunning React dashboard UI",               impressions: 310, clicks:  40, ctrPercent: 12.9, orders: 3, revenueCents: 149700 },
      { gigId: "gig_3", title: "I will develop a TypeScript REST API",                      impressions: 110, clicks:  13, ctrPercent: 11.8, orders: 0, revenueCents:      0 },
    ],
  },
  "90": {
    stats: { totalImpressions: 3680, totalClicks: 452, ctrPercent: 12.3, conversionPercent: 1.7 },
    gigBreakdown: [
      { gigId: "gig_1", title: "I will build a production-ready Next.js SaaS application", impressions: 2400, clicks: 298, ctrPercent: 12.4, orders: 12, revenueCents: 1198800 },
      { gigId: "gig_2", title: "I will create a stunning React dashboard UI",               impressions:  940, clicks: 118, ctrPercent: 12.6, orders:  4, revenueCents:  199600 },
      { gigId: "gig_3", title: "I will develop a TypeScript REST API",                      impressions:  340, clicks:  36, ctrPercent: 10.6, orders:  0, revenueCents:       0 },
    ],
  },
}

// MOCK Phase 2 — replace with prisma.gigAnalyticsDaily aggregation in Phase 3
export async function getAnalytics(range: "7" | "30" | "90" = "30"): Promise<ActionResult<AnalyticsData>> {
  await requireAuth("seller")
  return { success: true, data: MOCK_BY_RANGE[range] ?? MOCK_BY_RANGE["30"] }
}
