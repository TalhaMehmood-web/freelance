import Link from "next/link"
import {
  ChevronRight, Star, ShoppingBag, Clock, Users, Award,
  ArrowLeft, CheckCircle2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { cn, formatCurrency, formatRating, formatNumber, getInitials } from "@/lib/shared/utils"
import type { GigDetail } from "@/types/gigs"

export function GigHero({ gig }: { gig: GigDetail }) {
  return (
    <div className="space-y-3">
      {/* Back + breadcrumb row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/gigs"
          className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-brand-600 transition-colors shrink-0"
        >
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>
        <span className="text-text-tertiary/40 text-xs">|</span>
        <nav className="flex items-center gap-1 text-xs text-text-tertiary flex-wrap">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <Link href="/gigs" className="hover:text-brand-500 transition-colors">Services</Link>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
          <Link href={`/gigs?category=${gig.category.slug}`} className="hover:text-brand-500 transition-colors">
            {gig.category.name}
          </Link>
        </nav>
      </div>

      {/* Featured pill */}
      {gig.isFeatured && (
        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-accent-700 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded-full">
          <Award className="h-3 w-3 text-accent-500" /> Featured
        </span>
      )}

      {/* Title — compact */}
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug tracking-tight">
        {gig.title}
      </h1>

      {/* Seller row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Avatar className="h-8 w-8 ring-1 ring-brand-200 shrink-0">
          <AvatarImage src={gig.seller.avatarUrl ?? undefined} />
          <AvatarFallback className="text-2xs bg-brand-100 text-brand-700 font-bold">
            {getInitials(gig.seller.fullName)}
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/freelancers/${gig.seller.username}`}
          className="text-sm font-semibold text-text-primary hover:text-brand-600 transition-colors"
        >
          {gig.seller.fullName}
        </Link>
        <SellerLevelBadge level={gig.seller.sellerLevel} />
        {gig.seller.isVerified && (
          <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-success-700 bg-success-50 border border-success-100 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
          </span>
        )}
        {gig.reviewCount > 0 && (
          <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-accent-700")}>
            <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
            {formatRating(gig.avgRating)}
            <span className="text-text-tertiary font-normal">({formatNumber(gig.reviewCount)})</span>
          </span>
        )}
      </div>

      {/* Quick-stat chips */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-surface border border-border px-2.5 py-1 rounded-full">
          <ShoppingBag className="h-3 w-3 text-brand-400" />{formatNumber(gig.orderCount)} orders
        </span>
        {gig.inQueue > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-surface border border-border px-2.5 py-1 rounded-full">
            <Users className="h-3 w-3 text-warning-400" />{gig.inQueue} in queue
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-surface border border-border px-2.5 py-1 rounded-full">
          <Clock className="h-3 w-3 text-text-tertiary" />From {formatCurrency(gig.startingPriceCents)}
        </span>
      </div>
    </div>
  )
}
