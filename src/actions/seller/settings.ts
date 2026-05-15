"use server"

import { requireAuth } from "@/lib/server/auth"
import type { ActionResult } from "@/types/shared"

export interface SellerSettingsData {
  displayName:          string
  professionalTitle:    string
  overview:             string
  country:              string
  payoutCurrency:       string
  maxConcurrentOrders:  number
  availabilityStatus:   "available" | "busy" | "on_vacation"
  vacationAutoReply:    string
  vacationReturnDate:   string
  notifications: {
    newOrder:    boolean
    messages:    boolean
    reviews:     boolean
    promotional: boolean
  }
}

// MOCK Phase 2 — replace with prisma.sellerProfile.findUnique in Phase 3
export async function getSellerSettings(): Promise<ActionResult<SellerSettingsData>> {
  await requireAuth("seller")
  return {
    success: true,
    data: {
      displayName:         "Talha Mehmood",
      professionalTitle:   "Full-Stack Developer | Next.js & TypeScript Expert",
      overview:            "I build production-ready web applications with modern technologies. 5+ years of experience delivering high-quality software for startups and enterprises.",
      country:             "PK",
      payoutCurrency:      "USD",
      maxConcurrentOrders: 10,
      availabilityStatus:  "available",
      vacationAutoReply:   "",
      vacationReturnDate:  "",
      notifications: {
        newOrder:    true,
        messages:    true,
        reviews:     true,
        promotional: false,
      },
    },
  }
}

// MOCK Phase 2 — replace with prisma.sellerProfile.update
export async function updateProfile(data: Partial<SellerSettingsData>): Promise<ActionResult<null>> {
  await requireAuth("seller")
  return { success: true, data: null }
}

// MOCK Phase 2
export async function updateAvailability(data: {
  availabilityStatus: string
  vacationAutoReply?: string
  vacationReturnDate?: string
}): Promise<ActionResult<null>> {
  await requireAuth("seller")
  return { success: true, data: null }
}

// MOCK Phase 2
export async function updateNotifications(data: {
  newOrder: boolean
  messages: boolean
  reviews: boolean
  promotional: boolean
}): Promise<ActionResult<null>> {
  await requireAuth("seller")
  return { success: true, data: null }
}
