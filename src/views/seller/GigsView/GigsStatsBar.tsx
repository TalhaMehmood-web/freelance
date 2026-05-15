import { LayoutGrid, TrendingUp, ShoppingBag, Star } from "lucide-react"
import { formatNumber } from "@/lib/shared/utils"
import type { SellerGigRow } from "@/types/gigs"

interface GigsStatsBarProps {
  gigs: SellerGigRow[]
}

export function GigsStatsBar({ gigs }: GigsStatsBarProps) {
  const active     = gigs.filter(g => g.status === "active").length
  const totalOrders = gigs.reduce((s, g) => s + g.stats.orders, 0)
  const totalViews  = gigs.reduce((s, g) => s + g.stats.impressions, 0)
  const ratedGigs   = gigs.filter(g => g.stats.avgRating > 0)
  const avgRating   = ratedGigs.length
    ? ratedGigs.reduce((s, g) => s + g.stats.avgRating, 0) / ratedGigs.length
    : 0

  const stats = [
    { label: "Total Gigs",  value: String(gigs.length), sub: `${active} active`, icon: LayoutGrid, accent: "text-brand-600", bg: "bg-brand-50" },
    { label: "Total Views", value: formatNumber(totalViews),  sub: "all time",        icon: TrendingUp,  accent: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Orders",      value: String(totalOrders),       sub: "completed",       icon: ShoppingBag, accent: "text-green-600",  bg: "bg-green-50" },
    { label: "Avg Rating",  value: avgRating > 0 ? `★ ${avgRating.toFixed(1)}` : "—", sub: `${ratedGigs.length} rated gigs`, icon: Star, accent: "text-yellow-600", bg: "bg-yellow-50" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-surface rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{s.label}</span>
            <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-3.5 h-3.5 ${s.accent}`} />
            </div>
          </div>
          <p className="text-xl font-bold text-text-primary">{s.value}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
