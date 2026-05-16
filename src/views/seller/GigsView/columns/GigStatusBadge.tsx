import { Badge } from "@/components/ui/badge"
import type { SellerGigStatus } from "@/types/gigs"

const CONFIG: Record<SellerGigStatus, { label: string; className: string }> = {
  active:  { label: "Active",  className: "bg-green-50  text-green-700  border-green-200" },
  paused:  { label: "Paused",  className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  draft:   { label: "Draft",   className: "bg-surface-subtle text-text-secondary border-border" },
  deleted: { label: "Deleted", className: "bg-danger-50 text-danger-700 border-danger-200" },
}

export function GigStatusBadge({ status }: { status: SellerGigStatus }) {
  const c = CONFIG[status] ?? CONFIG.draft
  return (
    <Badge variant="outline" className={`text-xs font-medium ${c.className}`}>
      {c.label}
    </Badge>
  )
}
