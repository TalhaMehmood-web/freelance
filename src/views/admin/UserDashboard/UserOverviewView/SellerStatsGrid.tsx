import { Package, Zap, ShoppingBag, Star } from "lucide-react"
import { formatNumber, formatRating } from "@/lib/shared/utils"

interface StatCardProps {
  icon:       React.ReactNode
  label:      string
  value:      string | number
  iconBg:     string
  iconBorder: string
  valueBg:    string
}

function StatCard({ icon, label, value, iconBg, iconBorder, valueBg }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden bg-surface rounded-2xl border border-border shadow-card p-5 group hover:border-brand-200 hover:shadow-elevated transition-all duration-200`}>
      {/* Subtle bg glow */}
      <div className={`absolute inset-0 ${valueBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative flex flex-col gap-4">
        <div className={`w-11 h-11 rounded-xl ${iconBg} border ${iconBorder} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-primary leading-none">{value}</p>
        </div>
      </div>
    </div>
  )
}

interface Props {
  gigCount:    number
  activeGigs:  number
  totalOrders: number
  avgRating:   number
}

export function SellerStatsGrid({ gigCount, activeGigs, totalOrders, avgRating }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Package className="w-5 h-5 text-brand-500" />}
        label="Total Gigs"
        value={gigCount}
        iconBg="bg-brand-50"
        iconBorder="border-brand-100"
        valueBg="bg-linear-to-br from-brand-50/40 to-transparent"
      />
      <StatCard
        icon={<Zap className="w-5 h-5 text-success-500" />}
        label="Active Gigs"
        value={activeGigs}
        iconBg="bg-success-50"
        iconBorder="border-success-100"
        valueBg="bg-linear-to-br from-success-50/40 to-transparent"
      />
      <StatCard
        icon={<ShoppingBag className="w-5 h-5 text-orange-500" />}
        label="Completed Orders"
        value={formatNumber(totalOrders)}
        iconBg="bg-orange-50"
        iconBorder="border-orange-100"
        valueBg="bg-linear-to-br from-orange-50/40 to-transparent"
      />
      <StatCard
        icon={<Star className="w-5 h-5 text-accent-500 fill-accent-400" />}
        label="Avg Rating"
        value={avgRating > 0 ? formatRating(avgRating) : "—"}
        iconBg="bg-accent-50"
        iconBorder="border-accent-100"
        valueBg="bg-linear-to-br from-accent-50/40 to-transparent"
      />
    </div>
  )
}
