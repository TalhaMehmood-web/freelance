import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SpendAnalyticsView } from "@/views/buyer/SpendAnalyticsView"

export const metadata: Metadata = { title: "Spend Analytics | FreelanceHub" }

export default async function SpendPage() {
  await requireAuth()
  return <SpendAnalyticsView />
}
