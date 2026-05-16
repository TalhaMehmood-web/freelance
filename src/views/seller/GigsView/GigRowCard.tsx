"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Edit2, Pause, Play, Trash2, MoreHorizontal, Star,
  Eye, MousePointerClick, ShoppingBag, ExternalLink, Megaphone,
} from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn, formatCurrency, formatNumber } from "@/lib/shared/utils"
import { apiClient } from "@/lib/client/axios"
import type { SellerGigRow, SellerGigStatus } from "@/types/gigs"

interface GigRowCardProps {
  gig:            SellerGigRow
  onStatusChange: (gigId: string, newStatus: SellerGigStatus) => void
  onDelete:       (gigId: string) => void
}

const STATUS_BADGE: Record<SellerGigStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  active:  { variant: "default",     label: "Active" },
  paused:  { variant: "secondary",   label: "Paused" },
  draft:   { variant: "outline",     label: "Draft" },
  deleted: { variant: "destructive", label: "Deleted" },
}

function StatPill({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[64px]">
      <div className="flex items-center gap-1 text-xs font-semibold text-text-primary">
        <Icon className="h-3 w-3 text-text-tertiary" />
        {formatNumber(value)}
      </div>
      <span className="text-[10px] text-text-tertiary uppercase tracking-wide leading-none">{label}</span>
    </div>
  )
}

export function GigRowCard({ gig, onStatusChange, onDelete }: GigRowCardProps) {
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const badge = STATUS_BADGE[gig.status]

  const toggleMutation = useMutation({
    mutationFn: (status: "active" | "paused") =>
      apiClient.patch(`/api/seller/gigs/${gig.id}`, { status }),
    onSuccess: (_, status) => {
      onStatusChange(gig.id, status)
      queryClient.invalidateQueries({ queryKey: ["seller-gigs"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/seller/gigs/${gig.id}`),
    onSuccess: () => {
      setDeleteOpen(false)
      onDelete(gig.id)
      queryClient.invalidateQueries({ queryKey: ["seller-gigs"] })
    },
  })

  const isPending = toggleMutation.isPending || deleteMutation.isPending

  return (
    <>
      <article className="bg-surface rounded-2xl border border-border shadow-card p-4 flex gap-4 hover:shadow-elevated transition-shadow duration-200">
        {/* Thumbnail */}
        <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border border-border">
          {gig.coverImageUrl ? (
            <Image
              src={gig.coverImageUrl}
              alt={gig.title}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-brand-300 text-xl font-bold select-none">
              {gig.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate leading-snug">
                {gig.title}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                Starting at {formatCurrency(gig.packages.startingPriceCents)}
                {" · "}
                {gig.packages.packageCount} package{gig.packages.packageCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Badge variant={badge.variant} className="shrink-0">
              {badge.label}
            </Badge>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 pt-1 border-t border-border/60">
            <StatPill icon={Eye}              value={gig.stats.impressions} label="Views" />
            <StatPill icon={MousePointerClick} value={gig.stats.clicks}     label="Clicks" />
            <StatPill icon={ShoppingBag}       value={gig.stats.orders}     label="Orders" />
            {gig.stats.reviewCount > 0 ? (
              <div className="flex flex-col items-center gap-0.5 min-w-[64px]">
                <div className="flex items-center gap-1 text-xs font-semibold text-text-primary">
                  <Star className="h-3 w-3 text-accent-500 fill-accent-500" />
                  {gig.stats.avgRating.toFixed(1)}
                  <span className="text-text-tertiary font-normal">({formatNumber(gig.stats.reviewCount)})</span>
                </div>
                <span className="text-[10px] text-text-tertiary uppercase tracking-wide leading-none">Rating</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5 min-w-[64px]">
                <span className="text-xs text-text-tertiary">—</span>
                <span className="text-[10px] text-text-tertiary uppercase tracking-wide leading-none">Rating</span>
              </div>
            )}

            {/* Action buttons — pushed to the right */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                render={<Link href={`/seller/gigs/${gig.id}/edit`} />}
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>

              {(gig.status === "active" || gig.status === "paused") && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 gap-1.5 text-xs",
                    gig.status === "paused" && "text-success-500 border-success-500 hover:bg-success-100"
                  )}
                  onClick={() => toggleMutation.mutate(gig.status === "active" ? "paused" : "active")}
                  disabled={isPending}
                >
                  {gig.status === "active" ? (
                    <><Pause className="h-3 w-3" /> Pause</>
                  ) : (
                    <><Play className="h-3 w-3" /> Resume</>
                  )}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" size="icon-sm" variant="ghost" className="h-8 w-8" />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuItem
                    render={<Link href={`/gigs/${gig.slug}`} target="_blank" rel="noopener noreferrer" />}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on marketplace
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href={`/seller/gigs/${gig.id}/promote`} />}
                    className="gap-2"
                  >
                    <Megaphone className="h-4 w-4" />
                    Promote gig
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="gap-2"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete gig
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </article>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this gig?</DialogTitle>
            <DialogDescription>
              &ldquo;{gig.title}&rdquo; will be permanently removed from the marketplace. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={isPending}
              className="bg-danger-500 hover:bg-danger-500/90 text-white"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete gig"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
