import Link from "next/link"
import { Star, MapPin, MessageCircle, CheckCircle2, Clock, ShoppingBag } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { formatRating, formatNumber, getInitials } from "@/lib/shared/utils"
import type { SellerProfilePublic } from "@/types/freelancer"

export function SellerSidebar({ seller }: { seller: SellerProfilePublic }) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Seller header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 ring-2 ring-brand-100">
            <AvatarImage src={seller.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs bg-brand-100 text-brand-700 font-bold">
              {getInitials(seller.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Link
              href={`/freelancers/${seller.username}`}
              className="text-sm font-bold text-text-primary hover:text-brand-600 transition-colors block truncate"
            >
              {seller.fullName}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <SellerLevelBadge level={seller.sellerLevel} />
              {seller.isVerified && (
                <span className="inline-flex items-center gap-0.5 text-2xs font-medium text-success-700 bg-success-50 border border-success-100 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="h-2.5 w-2.5" />Verified
                </span>
              )}
            </div>
          </div>
        </div>
        {seller.professionalTitle && (
          <p className="text-xs text-text-secondary mt-2 truncate">{seller.professionalTitle}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="flex flex-col items-center py-3 gap-0.5">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-accent-500 text-accent-500" />
            <span className="text-sm font-bold text-text-primary">{formatRating(seller.avgRating)}</span>
          </div>
          <span className="text-2xs text-text-tertiary">Rating</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <div className="flex items-center gap-0.5">
            <ShoppingBag className="h-3 w-3 text-brand-400" />
            <span className="text-sm font-bold text-text-primary">{formatNumber(seller.completedOrders)}</span>
          </div>
          <span className="text-2xs text-text-tertiary">Orders</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <div className="flex items-center gap-0.5">
            <Clock className="h-3 w-3 text-success-500" />
            <span className="text-sm font-bold text-text-primary">~{seller.responseTimeHours}h</span>
          </div>
          <span className="text-2xs text-text-tertiary">Response</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Skills */}
        {seller.skills.length > 0 && (
          <div>
            <p className="text-2xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {seller.skills.slice(0, 8).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-2xs px-2 py-0.5 rounded-full">
                  {skill.name}
                </Badge>
              ))}
              {seller.skills.length > 8 && (
                <Badge variant="secondary" className="text-2xs px-2 py-0.5 rounded-full">
                  +{seller.skills.length - 8}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {seller.languages.length > 0 && (
          <div>
            <p className="text-2xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Languages</p>
            <div className="space-y-1">
              {seller.languages.map((lang, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary">{lang.language}</span>
                  <span className="text-text-tertiary">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-2xs text-text-tertiary pt-1">
          {seller.country && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-brand-400" />{seller.country}
            </span>
          )}
          <span>Since {seller.memberSinceYear}</span>
        </div>

        {/* CTAs */}
        <div className="space-y-2 pt-1">
          <Button className="w-full" size="sm" render={<Link href={`/freelancers/${seller.username}`} />}>
            View Profile
          </Button>
          <Button variant="outline" className="w-full" size="sm" disabled>
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />Contact
          </Button>
        </div>
      </div>
    </div>
  )
}
