import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { SellerOrdersView } from "@/views/seller/OrdersView"

export const metadata: Metadata = { title: "Orders | FreelanceHub" }

export default async function SellerOrdersPage() {
  await requireAuth(UserRole.Seller)
  return <SellerOrdersView />
}
