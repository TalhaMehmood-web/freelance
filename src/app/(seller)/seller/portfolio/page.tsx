import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { getPortfolio } from "@/actions/seller/portfolio"
import { SellerPortfolioView } from "@/views/seller/PortfolioView"

export const metadata: Metadata = { title: "Portfolio | FreelanceHub" }

export default async function SellerPortfolioPage() {
  await requireAuth("seller")
  const result = await getPortfolio()
  if (!result.success || !result.data) redirect("/seller/portfolio")
  return <SellerPortfolioView initialItems={result.data} />
}
