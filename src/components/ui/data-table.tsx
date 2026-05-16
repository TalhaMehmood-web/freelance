"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type OnChangeFn,
} from "@tanstack/react-table"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUp, ArrowDown, ArrowUpDown,
} from "lucide-react"

// ─── Sort header ─────────────────────────────────────────────────────────────
export function SortableHeader({
  label,
  column,
  currentSort,
  onSort,
}: {
  label:       string
  column:      string
  currentSort: { id: string; desc: boolean } | null
  onSort:      (column: string) => void
}) {
  const isActive = currentSort?.id === column
  const Icon = isActive
    ? currentSort!.desc ? ArrowDown : ArrowUp
    : ArrowUpDown

  return (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1.5 font-medium text-text-secondary hover:text-text-primary transition-colors"
    >
      {label}
      <Icon className={cn("w-3.5 h-3.5", isActive ? "opacity-100" : "opacity-40")} />
    </button>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  page:      number
  pageCount: number
  total:     number
  perPage:   number
  onPage:    (page: number) => void
}

export function DataTablePagination({
  page, pageCount, total, perPage, onPage,
}: PaginationProps) {
  const from  = (page - 1) * perPage + 1
  const to    = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-text-secondary">
      <span className="text-xs">
        Showing {from}–{to} of {total} results
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline" size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPage(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline" size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="px-2 text-xs font-medium text-text-primary">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline" size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline" size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPage(pageCount)}
          aria-label="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={i} className="border-border">
      {Array.from({ length: columns }).map((_, j) => (
        <TableCell key={j} className="px-4 py-3">
          <Skeleton className="h-4 w-full rounded-md" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
interface DataTableProps<TData> {
  columns:       ColumnDef<TData, any>[]
  data:          TData[]
  isLoading?:    boolean
  isFetching?:   boolean

  // Server-side sorting
  sorting?:      SortingState
  onSortChange?: OnChangeFn<SortingState>
  manualSorting?: boolean

  // Server-side pagination
  page?:         number
  pageCount?:    number
  total?:        number
  perPage?:      number
  onPage?:       (page: number) => void

  // Row selection
  rowSelection?:      RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  // Column visibility
  columnVisibility?:      VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>

  emptyMessage?: string
  className?:    string
  skeletonRows?: number
}

export function DataTable<TData>({
  columns, data, isLoading, isFetching,
  sorting, onSortChange, manualSorting = true,
  page, pageCount, total, perPage, onPage,
  rowSelection, onRowSelectionChange,
  columnVisibility, onColumnVisibilityChange,
  emptyMessage = "No results found.",
  className,
  skeletonRows = 5,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      ...(sorting           && { sorting }),
      ...(rowSelection      && { rowSelection }),
      ...(columnVisibility  && { columnVisibility }),
    },
    onSortingChange:          onSortChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    manualSorting,
    manualPagination: true,
    pageCount:        pageCount ?? -1,
    getCoreRowModel:  getCoreRowModel(),
    enableSortingRemoval: false,
  })

  const showPagination = onPage && pageCount !== undefined && total !== undefined && perPage !== undefined && page !== undefined

  return (
    <div className={cn("flex flex-col gap-3 min-w-0 w-full", className)}>
      {/* Table */}
      <div className={cn(
        "bg-surface rounded-2xl border border-border shadow-card overflow-hidden transition-opacity",
        isFetching && !isLoading && "opacity-60"
      )}>
        <div className="overflow-x-auto">
        <Table className="min-w-160">
          <TableHeader className="bg-surface-subtle">
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="border-border hover:bg-transparent">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="px-4 py-3 text-xs uppercase tracking-wide">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows columns={columns.length} rows={skeletonRows} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-16 text-text-secondary text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className="border-border hover:bg-surface-subtle"
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <DataTablePagination
          page={page!}
          pageCount={pageCount!}
          total={total!}
          perPage={perPage!}
          onPage={onPage!}
        />
      )}
    </div>
  )
}
