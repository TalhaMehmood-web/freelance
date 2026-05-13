import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { BuyerDashboardView } from "@/views/buyer/DashboardView"

export const metadata: Metadata = { title: "Dashboard | FreelanceHub" }

export default async function DashboardPage() {
  await requireAuth()
  return <BuyerDashboardView />
}
