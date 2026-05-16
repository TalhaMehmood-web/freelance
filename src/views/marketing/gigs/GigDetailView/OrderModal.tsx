"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Clock, RefreshCw, ShoppingCart, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/client/axios"
import { formatCurrency, pluralize } from "@/lib/shared/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { GigPackage } from "@/types/gigs"
import type { OrderCreatedResponse } from "@/types/orders"

interface OrderModalProps {
  open:     boolean
  onClose:  () => void
  pkg:      GigPackage
  gigId:    string
  gigTitle: string
}

function formatRevisions(n: number) {
  return n >= 99 ? "Unlimited revisions" : `${n} ${pluralize(n, "revision")}`
}

export function OrderModal({ open, onClose, pkg, gigId, gigTitle }: OrderModalProps) {
  const router = useRouter()
  const [requirements, setRequirements] = useState("")
  const [serverError, setServerError] = useState<string | null>(null)

  const placeMutation = useMutation({
    mutationFn: () =>
      apiClient
        .post<OrderCreatedResponse>("/api/orders", { gigId, packageId: pkg.id, requirements })
        .then(r => r.data),
    onSuccess: (data) => {
      toast.success("Order placed! Redirecting…")
      router.push(`/buyer/orders/${data.orderId}`)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Something went wrong. Please try again."
      setServerError(msg)
    },
  })

  function handleClose() {
    if (placeMutation.isPending) return
    setRequirements("")
    setServerError(null)
    placeMutation.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Place your order</DialogTitle>
          <DialogDescription className="text-xs text-text-secondary line-clamp-2">
            {gigTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Package summary */}
        <div className="rounded-xl border border-border bg-surface-subtle px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {pkg.packageType} — {pkg.name}
            </span>
            <span className="text-lg font-extrabold text-text-primary">
              {formatCurrency(pkg.priceCents)}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{pkg.description}</p>
          <div className="flex items-center gap-4 text-xs text-text-secondary pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-400" />
              {pkg.deliveryDays}-day delivery
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-brand-400" />
              {formatRevisions(pkg.revisions)}
            </span>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-primary">
            Requirements <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Describe what you need, share references, or paste relevant links…"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            maxLength={2000}
            rows={4}
            className="text-sm resize-none"
            disabled={placeMutation.isPending}
          />
          <p className="text-right text-2xs text-text-tertiary">{requirements.length}/2000</p>
        </div>

        {/* Error */}
        {serverError && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {serverError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={placeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => { setServerError(null); placeMutation.mutate() }}
            disabled={placeMutation.isPending}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {placeMutation.isPending ? "Placing order…" : `Place order — ${formatCurrency(pkg.priceCents)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
