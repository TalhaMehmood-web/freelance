import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { OrdersView } from "@/views/buyer/OrdersView"

export const metadata: Metadata = { title: "My Orders | FreelanceHub" }

export default async function OrdersPage() {
  await requireAuth()
  return <OrdersView />
}
