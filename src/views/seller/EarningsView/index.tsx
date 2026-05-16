"use client"

import { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Wallet, Clock, TrendingUp, DollarSign } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/shared/utils"
import type { EarningsStats, LedgerRow } from "@/types/seller"

const TYPE_BADGE: Record<string, string> = {
  order_credit:    "bg-green-50 text-green-700 border-green-200",
  withdrawal:      "bg-blue-50 text-blue-700 border-blue-200",
  refund:          "bg-danger-50 text-danger-700 border-danger-200",
  adjustment:      "bg-yellow-50 text-yellow-700 border-yellow-200",
  promotion_debit: "bg-orange-50 text-orange-700 border-orange-200",
}
const TYPE_LABEL: Record<string, string> = {
  order_credit: "Order Credit", withdrawal: "Withdrawal",
  refund: "Refund", adjustment: "Adjustment", promotion_debit: "Promotion",
}

const STATUS_BADGE: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  cleared:    "bg-green-50 text-green-700 border-green-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  failed:     "bg-danger-50 text-danger-700 border-danger-200",
}

const TYPE_TABS = [
  { label: "All",          value: "" },
  { label: "Order Credit", value: "order_credit" },
  { label: "Withdrawal",   value: "withdrawal" },
  { label: "Refund",       value: "refund" },
]

const col = createColumnHelper<LedgerRow>()

interface EarningsViewProps {
  stats:       EarningsStats
  entries:     LedgerRow[]
  total:       number
  pageCount:   number
  currentPage: number
  currentType: string
}

export function SellerEarningsView({
  stats, entries, total, pageCount, currentPage, currentType,
}: EarningsViewProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === "") params.delete(k)
      else params.set(k, v)
    })
    if (!("page" in updates)) params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const columns = [
    col.accessor("createdAt", {
      header: () => <span className="font-medium text-text-secondary">Date</span>,
      cell: ({ getValue }) => <span className="text-sm text-text-secondary">{formatDate(getValue())}</span>,
    }),
    col.accessor("type", {
      header: () => <span className="font-medium text-text-secondary">Type</span>,
      cell: ({ getValue }) => (
        <Badge variant="outline" className={`text-xs ${TYPE_BADGE[getValue()] ?? ""}`}>
          {TYPE_LABEL[getValue()] ?? getValue()}
        </Badge>
      ),
    }),
    col.accessor("description", {
      header: () => <span className="font-medium text-text-secondary">Description</span>,
      cell: ({ getValue }) => <span className="text-sm text-text-primary">{getValue()}</span>,
    }),
    col.accessor("orderId", {
      header: () => <span className="font-medium text-text-secondary">Order</span>,
      cell: ({ getValue }) => getValue()
        ? <span className="text-xs font-mono text-text-tertiary">#{(getValue() as string).slice(-8)}</span>
        : <span className="text-text-tertiary">—</span>,
    }),
    col.accessor("amountCents", {
      header: () => <span className="font-medium text-text-secondary">Amount</span>,
      cell: ({ getValue }) => {
        const v = getValue() as number
        return (
          <span className={`text-sm font-semibold ${v >= 0 ? "text-green-600" : "text-danger-600"}`}>
            {v >= 0 ? "+" : ""}{formatCurrency(Math.abs(v))}
          </span>
        )
      },
    }),
    col.accessor("status", {
      header: () => <span className="font-medium text-text-secondary">Status</span>,
      cell: ({ getValue }) => (
        <Badge variant="outline" className={`text-xs ${STATUS_BADGE[getValue()] ?? ""}`}>
          {getValue()}
        </Badge>
      ),
    }),
  ]

  const table = useReactTable({
    data: entries,
    columns,
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">Earnings</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Available",         value: formatCurrency(stats.availableBalanceCents), icon: Wallet,     accent: "text-green-600",  bg: "bg-green-50" },
          { label: "Pending Clearance", value: formatCurrency(stats.pendingClearanceCents),  icon: Clock,      accent: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Total Earned",      value: formatCurrency(stats.totalEarnedCents),        icon: TrendingUp, accent: "text-brand-600",  bg: "bg-brand-50" },
          { label: "This Month",        value: formatCurrency(stats.thisMonthCents),          icon: DollarSign, accent: "text-blue-600",   bg: "bg-blue-50" },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{s.label}</span>
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.accent}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1 w-fit">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => navigate({ type: tab.value || undefined })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentType === tab.value
                ? "bg-white text-text-primary shadow-sm border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ledger table */}
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
                  No transactions found.
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

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Page {currentPage} of {pageCount} · {total} entries</span>
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
