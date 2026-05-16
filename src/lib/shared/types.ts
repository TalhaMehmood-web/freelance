import type { UserRole, ActiveRole, OrgMemberRole, PlanTier, SellerLevel, AvailabilityStatus } from "./constants"

/* Server session resolved per request */
export interface Session {
  userId: string
  email: string
  grantedRoles: UserRole[]
  activeRole: ActiveRole
  isSuperAdmin: boolean
  orgId: string | null
  orgRole: OrgMemberRole | null
  orgPlan: PlanTier | null
  sellerProfileId: string | null
}

/* Plan feature flags — resolved from PlanTier */
export interface PlanFeatures {
  maxMembers: number | "unlimited"
  milestoneProjects: boolean
  teamCollaboration: boolean
  approvalWorkflows: boolean
  apiAccess: boolean
  ssoEnabled: boolean
  whitelabelEnabled: boolean
  auditLogDays: number | "unlimited"
  customContracts: boolean
  dedicatedAccountManager: boolean
  savedSearches: number | "unlimited"
  preferredSellers: number | "unlimited"
  platformFeePercent: number
  proposalDailyLimit: number | "unlimited"
}

/* Generic API response wrapper */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/* Pagination cursor */
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

/* Seller profile (public-facing shape) */
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

/* Gig card (list view) */
export interface GigCard {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  startingPriceCents: number
  avgRating: number
  reviewCount: number
  seller: {
    username: string
    fullName: string
    avatarUrl: string | null
    sellerLevel: SellerLevel
    country: string | null
  }
  isFeatured: boolean
  category: { name: string; slug: string }
}

/* Notification */
export interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: string
}

/* Upload result from Supabase Storage */
export interface UploadResult {
  path: string
  publicUrl: string
}
