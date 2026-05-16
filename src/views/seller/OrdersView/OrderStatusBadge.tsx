import { Badge } from "@/components/ui/badge"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-gray-50 text-gray-600 border-gray-200" },
  active:      { label: "Active",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  in_revision: { label: "In Revision", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  delivered:   { label: "Delivered",   className: "bg-purple-50 text-purple-700 border-purple-200" },
  completed:   { label: "Completed",   className: "bg-green-50 text-green-700 border-green-200" },
  cancelled:   { label: "Cancelled",   className: "bg-danger-50 text-danger-700 border-danger-200" },
  disputed:    { label: "Disputed",    className: "bg-orange-50 text-orange-700 border-orange-200" },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "" }
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  )
}
