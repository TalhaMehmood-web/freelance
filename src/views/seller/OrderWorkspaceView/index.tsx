"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, RotateCcw,
  Package, User, MessageCircle, Loader2, Paperclip, Send,
  CalendarDays, DollarSign, RefreshCw, TrendingUp,
} from "lucide-react"
import { Button }            from "@/components/ui/button"
import { Badge }             from "@/components/ui/badge"
import { Textarea }          from "@/components/ui/textarea"
import { Separator }         from "@/components/ui/separator"
import DImage                from "@/components/ui/d-image"
import { OrderStatusBadge }  from "@/views/seller/OrdersView/OrderStatusBadge"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/shared/utils"
import {
  useOrderDetail,
  useAcceptOrder,
  useDeliverOrder,
  useCancelOrder,
} from "./hooks/useOrderDetail"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client/axios"
import { toast } from "sonner"

interface Props { orderId: string }

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

function DueDateBadge({ dueAt }: { dueAt: string | null }) {
  if (!dueAt) return null
  const days = daysUntil(dueAt)!
  if (days < 0)  return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">Overdue by {Math.abs(days)}d</Badge>
  if (days === 0) return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">Due today</Badge>
  if (days <= 2)  return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Due in {days}d</Badge>
  return <Badge className="bg-surface text-text-secondary border-border text-xs">Due in {days}d</Badge>
}

function TimelineRow({ icon, label, date }: { icon: React.ReactNode; label: string; date: string | null }) {
  if (!date) return null
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex-shrink-0 text-brand-500">{icon}</div>
      <span className="text-text-secondary w-24 shrink-0">{label}</span>
      <span className="text-text-primary font-medium">{formatDate(date, { month: "short", day: "numeric", year: "numeric" })}</span>
    </div>
  )
}

function DeliverForm({ orderId, isRevision, revisionsAllowed, revisionsUsed, onDone }: {
  orderId: string; isRevision: boolean; revisionsAllowed: number; revisionsUsed: number; onDone: () => void
}) {
  const [message, setMessage] = useState("")
  const deliver = useDeliverOrder(orderId)

  function submit() {
    if (!message.trim()) return
    deliver.mutate({ message: message.trim(), attachments: [] }, { onSuccess: onDone })
  }

  return (
    <div className="space-y-4">
      {isRevision && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            Re-delivering after revision request.{" "}
            <span className="font-semibold">{revisionsUsed}/{revisionsAllowed}</span> revisions used.
          </p>
        </div>
      )}
      <Textarea
        placeholder="Describe what you've delivered and any instructions for the buyer…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="resize-none text-sm"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-text-secondary"
          disabled
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach files
        </Button>
        <span className="text-xs text-text-secondary">(coming soon)</span>
        <div className="flex-1" />
        <Button
          size="sm"
          className="gap-1.5 bg-brand-500 hover:bg-brand-600 text-white"
          onClick={submit}
          disabled={!message.trim() || deliver.isPending}
        >
          {deliver.isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Send className="h-3.5 w-3.5" />
          }
          {isRevision ? "Submit Revision" : "Deliver Work"}
        </Button>
      </div>
    </div>
  )
}

function MessageBuyerButton({ buyerUserId, conversationId }: { buyerUserId: string; conversationId: string | null }) {
  const router = useRouter()
  const qc = useQueryClient()

  const openConvo = useMutation({
    mutationFn: () =>
      apiClient
        .post<{ conversationId: string }>("/api/conversations", {
          type: "direct", participantId: buyerUserId,
        })
        .then((r) => r.data),
    onSuccess: ({ conversationId: id }) => {
      qc.invalidateQueries({ queryKey: ["conversations"] })
      router.push(`/seller/messages/${id}`)
    },
    onError: () => toast.error("Could not open conversation."),
  })

  if (conversationId) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        render={<Link href={`/seller/messages/${conversationId}`} />}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Message Buyer
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-1.5"
      onClick={() => openConvo.mutate()}
      disabled={openConvo.isPending}
    >
      {openConvo.isPending
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <MessageCircle className="h-3.5 w-3.5" />
      }
      {openConvo.isPending ? "Opening…" : "Message Buyer"}
    </Button>
  )
}

export function OrderWorkspaceView({ orderId }: Props) {
  const { data: order, isLoading, isError } = useOrderDetail(orderId)
  const accept  = useAcceptOrder(orderId)
  const cancel  = useCancelOrder(orderId)
  const [showDeliver, setShowDeliver] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-text-secondary" />
        <p className="text-text-secondary">Order not found or you don&apos;t have access.</p>
        <Button variant="outline" size="sm" render={<Link href="/seller/orders" />}>
          Back to orders
        </Button>
      </div>
    )
  }

  const isTerminal = ["completed", "cancelled", "disputed"].includes(order.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/20 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-text-secondary hover:text-text-primary"
          render={<Link href="/seller/orders" />}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Orders
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-xs text-text-secondary font-mono">#{order.id.slice(-8).toUpperCase()}</span>
        <OrderStatusBadge status={order.status} />
        <DueDateBadge dueAt={order.dueAt} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 max-w-7xl">

        {/* ── LEFT PANEL ── */}
        <div className="space-y-5">

          {/* Order title card */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-text-primary leading-tight">{order.title}</h1>
                {order.gig && (
                  <Link
                    href={`/gigs/${order.gig.slug}`}
                    className="text-sm text-brand-500 hover:underline mt-1 inline-block"
                  >
                    {order.gig.title}
                  </Link>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(order.priceCents)}</p>
                <p className="text-xs text-text-secondary mt-0.5">Your payout: {formatCurrency(order.freelancerPayoutCents)}</p>
              </div>
            </div>
            {order.description && (
              <p className="mt-4 text-sm text-text-secondary leading-relaxed">{order.description}</p>
            )}
          </div>

          {/* Requirements */}
          {order.requirements && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-500" />
                Buyer Requirements
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{order.requirements}</p>
            </div>
          )}

          {/* Delivery history */}
          {order.deliveries.length > 0 && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Send className="h-4 w-4 text-brand-500" />
                Delivery History
              </h2>
              <div className="space-y-4">
                {order.deliveries.map((d, i) => (
                  <div key={d.id} className="relative pl-6">
                    {i < order.deliveries.length - 1 && (
                      <span className="absolute left-[9px] top-7 bottom-0 w-px bg-border" />
                    )}
                    <div className="absolute left-0 top-1 h-[18px] w-[18px] rounded-full bg-brand-100 border-2 border-brand-400 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-brand-600">{i + 1}</span>
                    </div>
                    <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-brand-700">Delivery #{i + 1}</span>
                        <span className="text-xs text-text-secondary">{formatRelativeTime(d.createdAt)}</span>
                      </div>
                      {d.message && (
                        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{d.message}</p>
                      )}
                      {d.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {d.attachments.map((url, j) => (
                            <a
                              key={j}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline bg-white border border-brand-200 rounded-lg px-2.5 py-1"
                            >
                              <Paperclip className="h-3 w-3" />
                              Attachment {j + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action card */}
          {!isTerminal && (
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-500" />
                Your Action
              </h2>

              {/* PENDING */}
              {order.status === "pending" && (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    Review the requirements and accept this order to begin work, or decline if you&apos;re unable to complete it.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 gap-1.5 bg-brand-500 hover:bg-brand-600 text-white"
                      onClick={() => accept.mutate()}
                      disabled={accept.isPending}
                    >
                      {accept.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <CheckCircle2 className="h-4 w-4" />
                      }
                      Accept Order
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={cancel.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              )}

              {/* ACTIVE */}
              {order.status === "active" && (
                <div className="space-y-4">
                  {showDeliver ? (
                    <DeliverForm
                      orderId={orderId}
                      isRevision={false}
                      revisionsAllowed={order.revisionsAllowed}
                      revisionsUsed={order.revisionsUsed}
                      onDone={() => setShowDeliver(false)}
                    />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-text-secondary">
                        Work is in progress. When you&apos;re ready, deliver your work to the buyer.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 gap-1.5 bg-brand-500 hover:bg-brand-600 text-white"
                          onClick={() => setShowDeliver(true)}
                        >
                          <Send className="h-4 w-4" />
                          Deliver Work
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IN REVISION */}
              {order.status === "in_revision" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <RotateCcw className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Revision Requested</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        The buyer has requested changes. Review their feedback and re-deliver.
                      </p>
                    </div>
                  </div>
                  {showDeliver ? (
                    <DeliverForm
                      orderId={orderId}
                      isRevision={true}
                      revisionsAllowed={order.revisionsAllowed}
                      revisionsUsed={order.revisionsUsed}
                      onDone={() => setShowDeliver(false)}
                    />
                  ) : (
                    <Button
                      className="w-full gap-1.5 bg-brand-500 hover:bg-brand-600 text-white"
                      onClick={() => setShowDeliver(true)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Submit Revision
                    </Button>
                  )}
                </div>
              )}

              {/* DELIVERED */}
              {order.status === "delivered" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <Clock className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Awaiting Buyer Review</p>
                    <p className="text-xs text-purple-700 mt-0.5">
                      Your delivery is with the buyer. They will accept or request revisions.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancel confirm */}
              {showCancelConfirm && (
                <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 space-y-3">
                  <p className="text-sm font-medium text-red-800">Cancel this order?</p>
                  <p className="text-xs text-red-700">This action cannot be undone. The buyer will be notified.</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                      onClick={() => cancel.mutate(undefined, { onSuccess: () => setShowCancelConfirm(false) })}
                      disabled={cancel.isPending}
                    >
                      {cancel.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Yes, cancel
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowCancelConfirm(false)}>
                      Keep order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Terminal state card */}
          {isTerminal && (
            <div className={`rounded-2xl border shadow-card p-6 ${
              order.status === "completed"
                ? "bg-green-50 border-green-200"
                : order.status === "disputed"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex items-center gap-3">
                {order.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {order.status === "cancelled"  && <XCircle     className="h-5 w-5 text-gray-500"  />}
                {order.status === "disputed"   && <AlertCircle className="h-5 w-5 text-orange-600" />}
                <div>
                  <p className="text-sm font-semibold text-text-primary capitalize">{order.status}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {order.status === "completed" && order.completedAt && `Completed ${formatDate(order.completedAt)}`}
                    {order.status === "cancelled" && order.cancelledAt && `Cancelled ${formatDate(order.cancelledAt)}`}
                    {order.status === "disputed"  && "This order is under dispute review."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="space-y-5">

          {/* Buyer card */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Buyer
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <DImage
                src={order.buyer.avatarUrl ?? ""}
                alt={order.buyer.fullName}
                width={44}
                height={44}
                className="rounded-full object-cover shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">{order.buyer.fullName}</p>
                <p className="text-xs text-text-secondary">@{order.buyer.username}</p>
              </div>
            </div>
            <MessageBuyerButton
              buyerUserId={order.buyer.userId}
              conversationId={order.conversationId}
            />
          </div>

          {/* Financials */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5" />
              Financials
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Order price",    value: formatCurrency(order.priceCents),            muted: false },
                { label: "Platform fee",   value: `–${formatCurrency(order.platformFeeCents)}`, muted: true  },
                { label: "Your payout",    value: formatCurrency(order.freelancerPayoutCents),  muted: false },
              ].map(({ label, value, muted }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{label}</span>
                  <span className={muted ? "text-text-secondary" : "font-semibold text-text-primary"}>{value}</span>
                </div>
              ))}
              <Separator />
            </div>
          </div>

          {/* Revisions */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Revisions
            </h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                  <span>Used</span>
                  <span>{order.revisionsUsed} / {order.revisionsAllowed}</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-400 transition-all"
                    style={{ width: `${Math.min(100, (order.revisionsUsed / order.revisionsAllowed) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {order.revisionsAllowed - order.revisionsUsed} revision{order.revisionsAllowed - order.revisionsUsed !== 1 ? "s" : ""} remaining
            </p>
          </div>

          {/* Package details */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              Package Details
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Delivery</span>
                <span className="font-medium text-text-primary">{order.deliveryDays}d</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Revisions</span>
                <span className="font-medium text-text-primary">{order.revisionsAllowed}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              Timeline
            </h3>
            <div className="space-y-3">
              <TimelineRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Placed"     date={order.createdAt}   />
              <TimelineRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Started"    date={order.startedAt}   />
              <TimelineRow icon={<Send         className="h-3.5 w-3.5" />} label="Delivered"  date={order.deliveredAt} />
              <TimelineRow icon={<Clock        className="h-3.5 w-3.5" />} label="Due"        date={order.dueAt}       />
              <TimelineRow icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Completed"  date={order.completedAt} />
              <TimelineRow icon={<XCircle      className="h-3.5 w-3.5" />} label="Cancelled"  date={order.cancelledAt} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
