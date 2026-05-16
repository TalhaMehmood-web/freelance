import type { SellerLevel, GigPackageName } from "@/lib/shared/constants"
import type { SellerProfilePublic } from "@/types/freelancer"

export interface GigCard {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  images: { id: string; imageUrl: string }[]
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

export interface GigPackage {
  id: string
  packageType: GigPackageName
  name: string
  description: string
  priceCents: number
  deliveryDays: number
  revisions: number    // 99 = unlimited sentinel (matches validations.ts max)
  features: string[]
}

export interface GigImage {
  id: string
  imageUrl: string
  sortOrder: number    // 0-based ascending
}

export interface GigFAQItem {
  id: string
  question: string
  answer: string
}

export interface GigDetail {
  id: string
  slug: string
  title: string
  coverImageUrl: string | null
  startingPriceCents: number
  avgRating: number
  reviewCount: number
  isFeatured: boolean
  category: { name: string; slug: string }
  description: string
  packages: GigPackage[]
  images: GigImage[]
  faqs: GigFAQItem[]
  seller: SellerProfilePublic
  tags: string[]
  orderCount: number
  inQueue: number
  createdAt: string    // ISO-8601 — never call new Date() in Server Components
}

// "deleted" maps to Prisma GigStatus.suspended at the action boundary (soft-delete)
export type SellerGigStatus = "draft" | "active" | "paused" | "deleted"

export interface SellerGigRow {
  id:            string
  slug:          string
  title:         string
  status:        SellerGigStatus
  coverImageUrl: string | null
  packages: {
    startingPriceCents: number
    packageCount:       number
  }
  stats: {
    impressions:  number
    clicks:       number
    orders:       number
    avgRating:    number
    reviewCount:  number
  }
  createdAt: string  // ISO-8601
}
