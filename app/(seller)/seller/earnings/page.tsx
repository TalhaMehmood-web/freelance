import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { EarningsView } from "@/views/seller/EarningsView"

export const metadata: Metadata = { title: "Earnings | FreelanceHub" }

export default async function EarningsPage() {
  await requireAuth()
  return <EarningsView />
}
