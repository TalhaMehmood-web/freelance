import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { getAnalytics } from "@/actions/seller/analytics"
import { SellerAnalyticsView } from "@/views/seller/AnalyticsView"

export const metadata: Metadata = { title: "Analytics | FreelanceHub" }

export default async function SellerAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  await requireAuth("seller")
  const { range } = await searchParams
  const validRange = range === "7" || range === "90" ? range : "30"
  const result = await getAnalytics(validRange as "7" | "30" | "90")
  if (!result.success || !result.data) redirect("/seller/analytics")
  return <SellerAnalyticsView data={result.data} currentRange={validRange} />
}
