import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SellerAnalyticsView } from "@/views/seller/AnalyticsView"

export const metadata: Metadata = { title: "Analytics | FreelanceHub" }

export default async function SellerAnalyticsPage() {
  await requireAuth()
  return <SellerAnalyticsView />
}
