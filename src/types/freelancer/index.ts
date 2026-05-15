import type { SellerLevel, AvailabilityStatus } from "@/lib/shared/constants"

export interface PortfolioItemPublic {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  projectUrl: string | null
  completedAt: string | null // ISO-8601
}

export interface FreelancerProfile extends SellerProfilePublic {
  portfolio: PortfolioItemPublic[]
  // Future: gigs, reviews
}

export interface SellerProfilePublic {
  id: string
  userId: string
  username: string
  fullName: string
  avatarUrl: string | null
  professionalTitle: string
  overview: string
  hourlyRateCents: number | null
  avgRating: number
  totalReviews: number
  completedOrders: number
  sellerLevel: SellerLevel
  skills: { id: string; name: string }[]
  languages: { language: string; proficiency: string }[]
  availability: AvailabilityStatus
  responseTimeHours: number
  memberSinceYear: number
  isVerified: boolean
  isFeatured: boolean
  country: string | null
}
