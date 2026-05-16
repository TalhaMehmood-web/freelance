import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { getOrders, getOrderStatusCounts } from "@/actions/seller/orders"
import { SellerOrdersView } from "@/views/seller/OrdersView"

export const metadata: Metadata = { title: "Orders | FreelanceHub" }

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?:  string
    search?:  string
    page?:    string
    sortBy?:  string
    sortDir?: string
  }>
}) {
  await requireAuth(UserRole.Seller)
  const { status, search, page: pageParam, sortBy, sortDir } = await searchParams

  const page    = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)
  const validSortBy  = ["dueAt", "createdAt", "amountCents"].includes(sortBy ?? "")
    ? (sortBy as "dueAt" | "createdAt" | "amountCents")
    : "createdAt"
  const validSortDir = sortDir === "asc" ? "asc" : "desc"

  const [ordersResult, countsResult] = await Promise.all([
    getOrders({ status: status || undefined, search: search || undefined, page, sortBy: validSortBy, sortDir: validSortDir }),
    getOrderStatusCounts(),
  ])

  if (!ordersResult.success || !ordersResult.data) redirect("/seller/orders")
  if (!countsResult.success || !countsResult.data) redirect("/seller/orders")

  return (
    <SellerOrdersView
      orders={ordersResult.data.orders}
      total={ordersResult.data.total}
      pageCount={ordersResult.data.pageCount}
      counts={countsResult.data}
      currentPage={page}
      currentSort={{ id: validSortBy, desc: validSortDir === "desc" }}
      currentSearch={search ?? ""}
      currentStatus={status ?? ""}
    />
  )
}
