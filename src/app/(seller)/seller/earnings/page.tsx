import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { getEarningsStats, getLedger } from "@/actions/seller/earnings"
import { SellerEarningsView } from "@/views/seller/EarningsView"

export const metadata: Metadata = { title: "Earnings | FreelanceHub" }

export default async function SellerEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>
}) {
  await requireAuth("seller")
  const { page: pageParam, type } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const [statsResult, ledgerResult] = await Promise.all([
    getEarningsStats(),
    getLedger({ type: type || undefined, page }),
  ])

  if (!statsResult.success || !statsResult.data) redirect("/seller/earnings")
  if (!ledgerResult.success || !ledgerResult.data) redirect("/seller/earnings")

  return (
    <SellerEarningsView
      stats={statsResult.data}
      entries={ledgerResult.data.entries}
      total={ledgerResult.data.total}
      pageCount={ledgerResult.data.pageCount}
      currentPage={page}
      currentType={type ?? ""}
    />
  )
}
