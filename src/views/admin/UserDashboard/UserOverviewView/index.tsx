import { ProfileHero }      from "./ProfileHero"
import { SellerStatsGrid }  from "./SellerStatsGrid"
import { BuyerEmptyState }  from "./BuyerEmptyState"

interface SellerProfileData {
  id:                string
  displayName:       string
  professionalTitle: string
  sellerLevel:       string
  avgRating:         number
  totalReviews:      number
  completedOrders:   number
  isFeatured:        boolean
  identityVerified:  boolean
}

interface ProfileData {
  id:        string
  userId:    string
  username:  string
  fullName:  string
  avatarUrl: string | null
  email:     string
  roles:     string[]
  country:   string | null
  createdAt: string
  bio:       string | null
  isBlocked: boolean
  blockedAt: string | null
}

interface Stats {
  gigCount:    number
  activeGigs:  number
  totalOrders: number
  avgRating:   number
}

interface Props {
  profile:       ProfileData
  sellerProfile: SellerProfileData | null
  stats:         Stats
}

export function UserOverviewView({ profile, sellerProfile, stats }: Props) {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <ProfileHero profile={profile} sellerProfile={sellerProfile} />

      {sellerProfile ? (
        <SellerStatsGrid
          gigCount={stats.gigCount}
          activeGigs={stats.activeGigs}
          totalOrders={stats.totalOrders}
          avgRating={stats.avgRating}
        />
      ) : (
        <BuyerEmptyState />
      )}
    </div>
  )
}
