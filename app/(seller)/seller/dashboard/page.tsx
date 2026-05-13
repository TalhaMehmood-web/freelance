import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SellerDashboardView } from "@/views/seller/DashboardView"

export const metadata: Metadata = { title: "Seller Dashboard | FreelanceHub" }

export default async function SellerDashboardPage() {
  await requireAuth()
  return <SellerDashboardView />
}
