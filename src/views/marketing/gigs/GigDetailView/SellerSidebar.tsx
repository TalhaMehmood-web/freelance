import Link from "next/link"
import { Star, MapPin, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { formatRating, formatNumber, getInitials } from "@/lib/shared/utils"
import type { SellerProfilePublic } from "@/types/freelancer"

interface StatItemProps {
  icon?: React.ReactNode
  value: string
  label: string
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center gap-0.5">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-sm font-semibold text-text-primary">{value}</span>
      </div>
      <span className="text-xs text-text-tertiary">{label}</span>
    </div>
  )
}

interface SellerSidebarProps {
  seller: SellerProfilePublic
}

export function SellerSidebar({ seller }: SellerSidebarProps) {
  return (
    <aside>
      <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarImage src={seller.avatarUrl ?? undefined} />
            <AvatarFallback className="text-base bg-brand-100 text-brand-700">
              {getInitials(seller.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link
              href={`/freelancers/${seller.username}`}
              className="text-sm font-semibold text-text-primary hover:text-brand-500 transition-colors block truncate"
            >
              {seller.fullName}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <SellerLevelBadge level={seller.sellerLevel} />
              {seller.isVerified && (
                <span className="text-2xs font-medium text-success-500 bg-success-100 px-1.5 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1 line-clamp-1">
              {seller.professionalTitle}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatItem
            icon={<Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />}
            value={formatRating(seller.avgRating)}
            label="Rating"
          />
          <StatItem value={formatNumber(seller.completedOrders)} label="Orders" />
          <StatItem value={`~${seller.responseTimeHours}h`} label="Response" />
        </div>

        <Separator className="my-4" />

        {seller.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {seller.skills.slice(0, 6).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-2xs">
                  {skill.name}
                </Badge>
              ))}
              {seller.skills.length > 6 && (
                <Badge variant="secondary" className="text-2xs">
                  +{seller.skills.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}

        {seller.languages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
              Languages
            </p>
            <div className="space-y-1">
              {seller.languages.map((lang, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-primary">{lang.language}</span>
                  <span className="text-text-tertiary text-xs">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-text-tertiary mb-5">
          {seller.country && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {seller.country}
            </span>
          )}
          <span>Member since {seller.memberSinceYear}</span>
        </div>

        <div className="space-y-2">
          <Button className="w-full" size="lg" render={<Link href={`/freelancers/${seller.username}`} />}>
            View Profile
          </Button>
          <Button variant="outline" className="w-full" size="lg" disabled>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Seller
          </Button>
        </div>
      </div>
    </aside>
  )
}
