import Link from "next/link"
import Image from "next/image"
import { Star, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { formatCurrency, getInitials, formatNumber } from "@/lib/shared/utils"
import { cn } from "@/lib/shared/utils"
import type { GigCard as GigCardType } from "@/types/gigs"

interface GigCardProps {
  gig: GigCardType
  className?: string
}

export function GigCard({ gig, className }: GigCardProps) {
  return (
    <article
      className={cn(
        "group bg-surface rounded-xl border border-border overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {/* Cover image */}
      <Link href={`/gigs/${gig.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {gig.coverImageUrl ? (
          <Image
            src={gig.coverImageUrl}
            alt={gig.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
            <span className="text-brand-300 text-4xl font-bold">
              {gig.title.charAt(0)}
            </span>
          </div>
        )}

        {gig.isFeatured && (
          <span className="absolute top-2 left-2 bg-accent-500 text-white text-2xs font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}

        <button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/80 backdrop-blur-sm text-text-secondary hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Save gig"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Seller info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={gig.seller.avatarUrl ?? undefined} />
            <AvatarFallback className="text-2xs bg-brand-100 text-brand-700">
              {getInitials(gig.seller.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              href={`/freelancers/${gig.seller.username}`}
              className="text-sm font-medium text-text-primary hover:text-brand-500 transition-colors truncate"
            >
              {gig.seller.fullName}
            </Link>
            <SellerLevelBadge level={gig.seller.sellerLevel} />
          </div>
        </div>

        {/* Title */}
        <Link href={`/gigs/${gig.slug}`}>
          <h3 className="text-sm text-text-primary font-medium leading-snug line-clamp-2 hover:text-brand-500 transition-colors mb-3">
            {gig.title}
          </h3>
        </Link>

        {/* Rating */}
        {gig.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
            <span className="text-sm font-semibold text-text-primary">
              {gig.avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-text-tertiary">({formatNumber(gig.reviewCount)})</span>
          </div>
        )}

        {/* Category */}
        <Badge variant="secondary" className="text-2xs mb-3">
          {gig.category.name}
        </Badge>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-text-tertiary">Starting at</span>
        <span className="text-base font-bold text-text-primary">
          {formatCurrency(gig.startingPriceCents)}
        </span>
      </div>
    </article>
  )
}
