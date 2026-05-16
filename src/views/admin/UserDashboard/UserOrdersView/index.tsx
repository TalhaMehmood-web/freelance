"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, ExternalLink, CheckCircle2, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/shared/utils"
import { useUserOrdersQuery, useOrderStatusMutation } from "./hooks/useUserOrdersQuery"
import { ActiveRole } from "@/lib/shared/constants"

const STATUS_BADGE: Record<string, string> = {
  pending:     "bg-surface-muted text-text-secondary border-border",
  active:      "bg-brand-50 text-brand-700 border-brand-200",
  in_revision: "bg-warning-50 text-warning-700 border-warning-200",
  delivered:   "bg-blue-50 text-blue-700 border-blue-200",
  completed:   "bg-success-50 text-success-700 border-success-200",
  cancelled:   "bg-danger-50 text-danger-700 border-danger-200",
  disputed:    "bg-orange-50 text-orange-700 border-orange-200",
}

interface Props {
  userId: string
}

export function UserOrdersView({ userId }: Props) {
  const [role, setRole]   = useState<ActiveRole>(ActiveRole.Buyer)
  const [page, setPage]   = useState(1)

  const { data, isLoading } = useUserOrdersQuery(userId, role, page)
  const statusMutation = useOrderStatusMutation(userId, role, page)

  const orders    = data?.data      ?? []
  const total     = data?.total     ?? 0
  const pageCount = data?.pageCount ?? 1

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Orders</h2>
        <p className="text-sm text-text-secondary mt-0.5">{total} total orders</p>
      </div>

      {/* Role tabs */}
      <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1 w-fit">
        {[ActiveRole.Buyer, ActiveRole.Seller].map(r => (
          <button
            key={r}
            onClick={() => { setRole(r); setPage(1) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              role === r
                ? "bg-white text-text-primary shadow-sm border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            As {r}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-surface-subtle border-b border-border text-xs font-medium text-text-secondary">
          <span>Order</span>
          <span>Counterparty</span>
          <span>Status</span>
          <span>Price</span>
          <span className="text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-text-secondary">
            <ShoppingBag className="w-10 h-10 mb-3 text-brand-200" />
            <p className="font-medium">No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map(order => {
              const counterparty = role === "buyer" ? order.freelancer : order.client
              const canComplete  = order.status === "delivered"
              const canCancel    = ["pending", "active"].includes(order.status)
              const canRefund    = order.status === "completed"

              return (
                <div key={order.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-surface-subtle transition-colors">
                  {/* Order info */}
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">{order.title}</p>
                    {order.gigTitle && (
                      <p className="text-xs text-text-tertiary truncate mt-0.5">
                        Gig: {order.gigTitle}
                      </p>
                    )}
                    <p className="text-xs text-text-tertiary mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Counterparty */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{counterparty.fullName}</p>
                    <p className="text-xs text-text-tertiary">@{counterparty.username}</p>
                  </div>

                  {/* Status */}
                  <Badge variant="outline" className={`text-xs whitespace-nowrap ${STATUS_BADGE[order.status] ?? ""}`}>
                    {order.status.replace("_", " ")}
                  </Badge>

                  {/* Price */}
                  <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                    {formatCurrency(order.priceCents)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {order.gigSlug && (
                      <Button
                        size="icon-sm" variant="ghost"
                        aria-label="View gig"
                        render={<Link href={`/gigs/${order.gigSlug}`} target="_blank" />}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {canComplete && (
                      <Button
                        size="icon-sm" variant="ghost"
                        aria-label="Mark complete"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ orderId: order.id, status: "completed" })}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                      </Button>
                    )}
                    {canRefund && (
                      <Button
                        size="icon-sm" variant="ghost"
                        aria-label="Refund (revert to pending)"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ orderId: order.id, status: "pending" })}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-brand-500" />
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        size="icon-sm" variant="ghost"
                        aria-label="Cancel order"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ orderId: order.id, status: "cancelled" })}
                      >
                        <XCircle className="w-3.5 h-3.5 text-danger-500" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Page {page} of {pageCount} · {total} orders</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
