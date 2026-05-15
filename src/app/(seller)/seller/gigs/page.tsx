import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { GigsView } from "@/views/seller/GigsView"

export const metadata: Metadata = { title: "My Gigs | FreelanceHub" }

export default async function SellerGigsPage() {
  await requireAuth("seller")
  return <GigsView />
}
