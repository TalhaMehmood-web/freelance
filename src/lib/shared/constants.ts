/* Platform-wide constants. Do not hardcode these elsewhere. */

export const PLATFORM_FEE_PERCENT = {
  free: 20,
  pro: 15,
  business: 10,
  enterprise: 5,
} as const

export const PLAN_TIERS = ["free", "pro", "business", "enterprise"] as const
export type PlanTier = (typeof PLAN_TIERS)[number]

export const SELLER_LEVELS = {
  new: {
    label: "New Seller",
    minCompletedOrders: 0,
    minDaysActive: 0,
    minRating: 0,
    feeDiscount: 0,
  },
  level_1: {
    label: "Level 1",
    minCompletedOrders: 10,
    minDaysActive: 30,
    minRating: 4.7,
    feeDiscount: 2,
  },
  level_2: {
    label: "Level 2",
    minCompletedOrders: 50,
    minDaysActive: 60,
    minRating: 4.8,
    feeDiscount: 4,
  },
  top_rated: {
    label: "Top Rated",
    minCompletedOrders: 100,
    minDaysActive: 365,
    minRating: 4.9,
    feeDiscount: 8,
  },
} as const

export type SellerLevel = keyof typeof SELLER_LEVELS

export const ORDER_CLEARANCE_DAYS = 14

export const PROPOSAL_DAILY_LIMIT = {
  free: 10,
  pro: 30,
  business: 100,
  enterprise: Infinity,
} as const

export const MAX_GIG_IMAGES = 5
export const MAX_PORTFOLIO_IMAGES = 10
export const MAX_SAVED_SEARCHES = {
  free: 3,
  pro: 20,
  business: Infinity,
  enterprise: Infinity,
} as const

export const MAX_PREFERRED_SELLERS = {
  free: 5,
  pro: 20,
  business: Infinity,
  enterprise: Infinity,
} as const

export const MAX_ORG_MEMBERS = {
  free: 1,
  pro: 10,
  business: 50,
  enterprise: Infinity,
} as const

export const AUDIT_LOG_RETENTION_DAYS = {
  free: 0,
  pro: 30,
  business: 365,
  enterprise: 365 * 7,
} as const

export const AVAILABILITY_STATUSES = ["available", "busy", "on_vacation"] as const
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number]

export const ORDER_STATUSES = [
  "pending",
  "active",
  "in_revision",
  "delivered",
  "completed",
  "cancelled",
  "disputed",
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PROPOSAL_STATUSES = ["pending", "shortlisted", "accepted", "rejected", "withdrawn"] as const
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number]

export enum UserRole {
  Buyer  = "buyer",
  Seller = "seller",
  Admin  = "admin",
}

export enum ActiveRole {
  Buyer  = "buyer",
  Seller = "seller",
}

export const USER_ROLE_VALUES = Object.values(UserRole)

export const ORG_MEMBER_ROLES = ["owner", "admin", "member", "billing_manager", "viewer"] as const
export type OrgMemberRole = (typeof ORG_MEMBER_ROLES)[number]

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
export const APP_NAME = "FreelanceHub"

export const GIG_PACKAGE_NAMES = ["basic", "standard", "premium"] as const
export type GigPackageName = (typeof GIG_PACKAGE_NAMES)[number]

export const STRIPE_PLATFORM_FEE_PERCENT = 20

export const MIN_GIG_PRICE_CENTS = 500
export const MIN_WITHDRAWAL_CENTS = 2000
export const MAX_CUSTOM_OFFER_DURATION_DAYS = 7

export const NOTIFICATION_TYPES = [
  "order_update",
  "new_message",
  "new_proposal",
  "payment",
  "review",
  "system",
  "approval_request",
  "dispute",
  "saved_search_match",
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]
