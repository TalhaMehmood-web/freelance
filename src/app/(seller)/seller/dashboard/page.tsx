import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { getDashboardData } from "@/actions/seller/dashboard"
import { SellerDashboardView } from "@/views/seller/DashboardView"

export const metadata: Metadata = { title: "Seller Dashboard | FreelanceHub" }

export default async function SellerDashboardPage() {
  await requireAuth(UserRole.Seller)
  const result = await getDashboardData()
  if (!result.success || !result.data) redirect("/seller/dashboard")
  return <SellerDashboardView data={result.data} />
}
