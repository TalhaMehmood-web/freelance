import { Clock, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react"
import type { GigDetail } from "@/types/gigs"

interface Item { icon: React.ReactNode; value: string; label: string }

export function GigHighlights({ gig }: { gig: GigDetail }) {
  const pkg = gig.packages[0]
  if (!pkg) return null

  const items: Item[] = [
    { icon: <Clock className="h-3.5 w-3.5 text-brand-500" />,   value: `${pkg.deliveryDays}d`, label: "Delivery" },
    {
      icon: <RefreshCw className="h-3.5 w-3.5 text-success-500" />,
      value: pkg.revisions >= 99 ? "∞" : `${pkg.revisions}`,
      label: pkg.revisions >= 99 ? "Unlimited revisions" : `Revision${pkg.revisions !== 1 ? "s" : ""}`,
    },
    ...(gig.seller.isVerified
      ? [{ icon: <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />, value: "Verified", label: "Identity" }]
      : []),
    ...(gig.orderCount > 0
      ? [{ icon: <TrendingUp className="h-3.5 w-3.5 text-orange-500" />, value: `${gig.orderCount}+`, label: "Completed" }]
      : []),
  ]

  return (
    <div className="flex flex-wrap gap-3 py-3 px-1 border-y border-border">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          {item.icon}
          <span className="font-semibold text-text-primary">{item.value}</span>
          <span className="text-text-tertiary">{item.label}</span>
          {i < items.length - 1 && <span className="text-border ml-1">·</span>}
        </div>
      ))}
    </div>
  )
}
