"use server"

import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"
import type { SellerSettingsData } from "@/types/seller"


// MOCK Phase 2 — replace with prisma.sellerProfile.findUnique in Phase 3
export async function getSellerSettings(): Promise<ActionResult<SellerSettingsData>> {
  await requireAuth(UserRole.Seller)
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
