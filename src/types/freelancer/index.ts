import type { SellerLevel, AvailabilityStatus } from "@/lib/shared/constants"

export interface PortfolioItemPublic {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  projectUrl: string | null
  completedAt: string | null // ISO-8601
}

export interface FreelancerGig {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  startingPriceCents: number
  avgRating: number
  reviewCount: number
  totalOrders: number
}

export interface FreelancerReview {
  id: string
  reviewerName: string
  reviewerAvatarUrl: string | null
  rating: number
  communicationRating: number
  qualityRating: number
  deliveryRating: number
  comment: string | null
  createdAt: string
}

export interface FreelancerEducation {
  institution: string
  degree: string
  fieldOfStudy: string
  from: string
  to: string | null
}

export interface FreelancerCertification {
  name: string
  provider: string
  year: string
}

export interface FreelancerProfile extends SellerProfilePublic {
  portfolio: PortfolioItemPublic[]
  gigs: FreelancerGig[]
  reviews: FreelancerReview[]
  education: FreelancerEducation[]
  certifications: FreelancerCertification[]
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
