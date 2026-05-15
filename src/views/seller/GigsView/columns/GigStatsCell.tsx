import { Eye, MousePointerClick, ShoppingBag, Star } from "lucide-react"
import { formatNumber } from "@/lib/shared/utils"
import type { SellerGigRow } from "@/types/gigs"

export function GigImpressionsCell({ gig }: { gig: SellerGigRow }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-text-primary">
      <Eye className="w-3.5 h-3.5 text-text-tertiary" />
      {formatNumber(gig.stats.impressions)}
    </div>
  )
}

export function GigClicksCell({ gig }: { gig: SellerGigRow }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-text-primary">
      <MousePointerClick className="w-3.5 h-3.5 text-text-tertiary" />
      {formatNumber(gig.stats.clicks)}
    </div>
  )
}

export function GigOrdersCell({ gig }: { gig: SellerGigRow }) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
      <ShoppingBag className="w-3.5 h-3.5 text-text-tertiary" />
      {gig.stats.orders}
    </div>
  )
}

export function GigRatingCell({ gig }: { gig: SellerGigRow }) {
  if (gig.stats.reviewCount === 0) {
    return <span className="text-xs text-text-tertiary">—</span>
  }
  return (
    <div className="flex items-center gap-1 text-sm">
      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      <span className="font-semibold text-text-primary">{gig.stats.avgRating.toFixed(1)}</span>
      <span className="text-xs text-text-tertiary">({gig.stats.reviewCount})</span>
    </div>
  )
}
