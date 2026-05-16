"use client"

import { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import {
  useReactTable, getCoreRowModel, flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search, ExternalLink } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/shared/utils"
import type { SellerOrderRow, OrderStatusCounts } from "@/actions/seller/orders"

const SearchSchema = z.object({ search: z.string() })
type SearchForm = z.infer<typeof SearchSchema>

const col = createColumnHelper<SellerOrderRow>()

const STATUS_TABS = [
  { label: "All",         value: "" },
  { label: "Active",      value: "active" },
  { label: "In Revision", value: "in_revision" },
  { label: "Delivered",   value: "delivered" },
  { label: "Completed",   value: "completed" },
  { label: "Cancelled",   value: "cancelled" },
]

interface OrdersViewProps {
  orders:       SellerOrderRow[]
  counts:       OrderStatusCounts
  total:        number
  pageCount:    number
  currentPage:  number
  currentSort:  { id: string; desc: boolean }
  currentSearch: string
  currentStatus: string
}

export function SellerOrdersView({
  orders, counts, total, pageCount,
  currentPage, currentSort, currentSearch, currentStatus,
}: OrdersViewProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const searchForm = useForm<SearchForm>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { search: currentSearch },
  })

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k)
      else params.set(k, v)
    })
    if (!("page" in updates)) params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleSort(id: string) {
    const isActive = currentSort.id === id
    navigate({ sortBy: id, sortDir: isActive && !currentSort.desc ? "desc" : "asc" })
  }

  function handleSearch({ search }: SearchForm) {
    navigate({ search: search || undefined })
  }

  const SortIcon = ({ id }: { id: string }) => {
    if (currentSort.id !== id) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
    return currentSort.desc ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
  }

  const totalCounts: Record<string, number> = {
    "": total,
    active:      counts.active,
    in_revision: counts.in_revision,
    delivered:   counts.delivered,
    completed:   counts.completed,
    cancelled:   counts.cancelled,
  }

  const columns = [
    col.accessor("title", {
      header: () => (
        <button className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary" onClick={() => handleSort("title")}>
          Order <SortIcon id="title" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary text-sm truncate max-w-[200px]">{row.original.title}</p>
          <p className="text-xs text-text-tertiary font-mono">#{row.original.id.slice(-8)}</p>
        </div>
      ),
    }),
    col.accessor("buyerName", {
      header: () => <span className="font-medium text-text-secondary">Buyer</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand-700">{getInitials(row.original.buyerName)}</span>
          </div>
          <span className="text-sm text-text-primary">{row.original.buyerName}</span>
        </div>
      ),
    }),
    col.accessor("status", {
      header: () => <span className="font-medium text-text-secondary">Status</span>,
      cell: ({ getValue }) => <OrderStatusBadge status={getValue()} />,
    }),
    col.accessor("dueAt", {
      header: () => (
        <button className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary" onClick={() => handleSort("dueAt")}>
          Due <SortIcon id="dueAt" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-text-secondary">{formatRelativeTime(getValue())}</span>
      ),
    }),
    col.accessor("amountCents", {
      header: () => (
        <button className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary" onClick={() => handleSort("amountCents")}>
          Amount <SortIcon id="amountCents" />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-text-primary">{formatCurrency(getValue())}</span>
      ),
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" render={<Link href={`/seller/orders/${row.original.id}`} />}>
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            View
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting: [{ id: currentSort.id, desc: currentSort.desc }] },
    manualSorting: true,
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-text-primary">Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active",      value: counts.active,      color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "In Revision", value: counts.in_revision, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Delivered",   value: counts.delivered,   color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completed",   value: counts.completed,   color: "text-green-600",  bg: "bg-green-50" },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border shadow-card p-4">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={searchForm.handleSubmit(handleSearch)} className="relative min-w-50 max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <Input placeholder="Search orders…" {...searchForm.register("search")} className="pl-9" />
        </form>

        <div className="flex flex-wrap items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => navigate({ status: tab.value || undefined })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                currentStatus === tab.value
                  ? "bg-white text-text-primary shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
              {tab.value !== "" && (
                <span className="ml-1 text-xs text-text-tertiary">
                  {totalCounts[tab.value] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader className="bg-surface-subtle">
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="border-border">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-text-secondary">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="border-border hover:bg-surface-subtle">
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Page {currentPage} of {pageCount} · {total} orders</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => navigate({ page: String(currentPage - 1) })}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= pageCount} onClick={() => navigate({ page: String(currentPage + 1) })}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
