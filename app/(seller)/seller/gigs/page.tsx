import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { SellerGigsView } from "@/views/seller/GigsView"

export const metadata: Metadata = { title: "My Gigs | FreelanceHub" }

export default async function SellerGigsPage() {
  await requireAuth()
  return <SellerGigsView />
}
