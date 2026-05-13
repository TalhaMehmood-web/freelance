import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SellerOrdersView } from "@/views/seller/OrdersView"

export const metadata: Metadata = { title: "Orders | FreelanceHub" }

export default async function SellerOrdersPage() {
  await requireAuth()
  return <SellerOrdersView />
}
