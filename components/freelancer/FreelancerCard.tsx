import Link from "next/link"
import { Star, MapPin, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SellerLevelBadge } from "./SellerLevelBadge"
import { formatCurrency, getInitials, formatNumber } from "@/lib/shared/utils"
import { cn } from "@/lib/shared/utils"
import type { SellerProfilePublic } from "@/lib/shared/types"

interface FreelancerCardProps {
  seller: SellerProfilePublic
  className?: string
}

export function FreelancerCard({ seller, className }: FreelancerCardProps) {
  return (
    <article
      className={cn(
        "bg-surface rounded-xl border border-border p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Link href={`/freelancers/${seller.username}`}>
          <Avatar className="h-14 w-14">
            <AvatarImage src={seller.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-brand-100 text-brand-700 text-lg font-semibold">
              {getInitials(seller.fullName)}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/freelancers/${seller.username}`}
              className="font-semibold text-text-primary hover:text-brand-500 transition-colors truncate"
            >
              {seller.fullName}
            </Link>
            <SellerLevelBadge level={seller.sellerLevel} />
            {seller.isVerified && (
              <span className="text-2xs font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                Verified
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-0.5 truncate">{seller.professionalTitle}</p>

          {seller.country && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary mt-1">
              <MapPin className="h-3 w-3" />
              {seller.country}
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      {seller.totalReviews > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
            <span className="text-sm font-semibold text-text-primary">{seller.avgRating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-text-tertiary">({formatNumber(seller.totalReviews)} reviews)</span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs text-text-tertiary">{seller.completedOrders} orders</span>
        </div>
      )}

      {/* Skills */}
      {seller.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {seller.skills.slice(0, 4).map((skill) => (
            <Badge key={skill.id} variant="secondary" className="text-2xs">
              {skill.name}
            </Badge>
          ))}
          {seller.skills.length > 4 && (
            <Badge variant="secondary" className="text-2xs">
              +{seller.skills.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-text-tertiary">
          <Clock className="h-3.5 w-3.5" />
          <span>Responds in ~{seller.responseTimeHours}h</span>
        </div>
        {seller.hourlyRateCents && (
          <div className="text-sm font-bold text-text-primary">
            {formatCurrency(seller.hourlyRateCents)}<span className="text-xs font-normal text-text-tertiary">/hr</span>
          </div>
        )}
      </div>
    </article>
  )
}
