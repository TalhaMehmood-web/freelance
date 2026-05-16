import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { OrderWorkspaceView } from "@/views/seller/OrderWorkspaceView"

export const metadata: Metadata = { title: "Order Workspace | FreelanceHub" }

export default async function OrderWorkspacePage({ params }: { params: Promise<{ orderId: string }> }) {
  await requireAuth()
  const { orderId } = await params
  return <OrderWorkspaceView orderId={orderId} />
}
