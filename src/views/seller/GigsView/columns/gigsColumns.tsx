import { type ColumnDef } from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/react-table"
import { SortableHeader } from "@/components/ui/data-table"
import { formatCurrency, formatDate } from "@/lib/shared/utils"
import { GigTitleCell } from "./GigTitleCell"
import { GigStatusBadge } from "./GigStatusBadge"
import {
  GigImpressionsCell, GigClicksCell, GigOrdersCell, GigRatingCell,
} from "./GigStatsCell"
import { GigActionsCell } from "./GigActionsCell"
import type { SellerGigRow } from "@/types/gigs"

const col = createColumnHelper<SellerGigRow>()

export function buildGigsColumns(
  currentSort: { id: string; desc: boolean } | null,
  onSort:      (column: string) => void,
  onMutate:    () => void,
): ColumnDef<SellerGigRow, any>[] {
  return [
    col.display({
      id:     "title",
      header: () => (
        <SortableHeader label="Gig" column="title" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => <GigTitleCell gig={row.original} />,
    }),
    col.display({
      id:     "status",
      header: () => <span className="font-medium text-text-secondary">Status</span>,
      cell:   ({ row }) => <GigStatusBadge status={row.original.status} />,
    }),
    col.display({
      id:     "price",
      header: () => (
        <SortableHeader label="Starting at" column="price_asc" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <div>
          <span className="text-sm font-semibold text-text-primary">
            {formatCurrency(row.original.packages.startingPriceCents)}
          </span>
          <span className="text-xs text-text-tertiary ml-1">
            / {row.original.packages.packageCount} pkg
          </span>
        </div>
      ),
    }),
    col.display({
      id:     "impressions",
      header: () => (
        <SortableHeader label="Impressions" column="impressions" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => <GigImpressionsCell gig={row.original} />,
    }),
    col.display({
      id:     "clicks",
      header: () => <span className="font-medium text-text-secondary">Clicks</span>,
      cell:   ({ row }) => <GigClicksCell gig={row.original} />,
    }),
    col.display({
      id:     "orders",
      header: () => (
        <SortableHeader label="Orders" column="orders" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => <GigOrdersCell gig={row.original} />,
    }),
    col.display({
      id:     "rating",
      header: () => <span className="font-medium text-text-secondary">Rating</span>,
      cell:   ({ row }) => <GigRatingCell gig={row.original} />,
    }),
    col.display({
      id:     "createdAt",
      header: () => (
        <SortableHeader label="Created" column="newest" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-text-tertiary">{formatDate(row.original.createdAt)}</span>
      ),
    }),
    col.display({
      id:     "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell:   ({ row }) => <GigActionsCell gig={row.original} onMutate={onMutate} />,
    }),
  ]
}
