import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { PortfolioView } from "@/views/seller/PortfolioView"

export const metadata: Metadata = { title: "Portfolio | FreelanceHub" }

export default async function PortfolioPage() {
  await requireAuth()
  return <PortfolioView />
}
