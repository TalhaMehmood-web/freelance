import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { OrderDetailView } from "@/views/buyer/OrderDetailView"

export const metadata: Metadata = { title: "Order Details | FreelanceHub" }

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  await requireAuth()
  const { orderId } = await params
  return <OrderDetailView orderId={orderId} />
}
