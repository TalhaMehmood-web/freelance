"use client"

import { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from "@tanstack/react-table"
import { Eye, MousePointerClick, BarChart2, ShoppingBag } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/shared/utils"
import type { AnalyticsData, GigAnalyticsRow } from "@/actions/seller/analytics"

const RANGE_TABS = [
  { label: "Last 7 days",  value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
]

const col = createColumnHelper<GigAnalyticsRow>()

interface AnalyticsViewProps {
  data:         AnalyticsData
  currentRange: string
}

export function SellerAnalyticsView({ data, currentRange }: AnalyticsViewProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => params.set(k, v))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const { stats, gigBreakdown } = data

  const columns = [
    col.accessor("title", {
      header: () => <span className="font-medium text-text-secondary">Gig</span>,
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-text-primary truncate max-w-[240px] block">{getValue()}</span>
      ),
    }),
    col.accessor("impressions", {
      header: () => <span className="font-medium text-text-secondary">Impressions</span>,
      cell: ({ getValue }) => <span className="text-sm text-text-primary">{formatNumber(getValue())}</span>,
    }),
    col.accessor("clicks", {
      header: () => <span className="font-medium text-text-secondary">Clicks</span>,
      cell: ({ getValue }) => <span className="text-sm text-text-primary">{formatNumber(getValue())}</span>,
    }),
    col.accessor("ctrPercent", {
      header: () => <span className="font-medium text-text-secondary">CTR</span>,
      cell: ({ getValue }) => <span className="text-sm text-text-primary">{(getValue() as number).toFixed(1)}%</span>,
    }),
    col.accessor("orders", {
      header: () => <span className="font-medium text-text-secondary">Orders</span>,
      cell: ({ getValue }) => <span className="text-sm font-semibold text-text-primary">{getValue()}</span>,
    }),
    col.accessor("revenueCents", {
      header: () => <span className="font-medium text-text-secondary">Revenue</span>,
      cell: ({ getValue }) => (
        <span className="text-sm font-semibold text-green-600">{formatCurrency(getValue() as number)}</span>
      ),
    }),
  ]

  const table = useReactTable({
    data: gigBreakdown,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header + range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1">
          {RANGE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => navigate({ range: tab.value })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRange === tab.value
                  ? "bg-white text-text-primary shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Impressions",  value: formatNumber(stats.totalImpressions),        icon: Eye,                accent: "text-brand-600",  bg: "bg-brand-50" },
          { label: "Clicks",       value: formatNumber(stats.totalClicks),             icon: MousePointerClick,  accent: "text-blue-600",   bg: "bg-blue-50" },
          { label: "CTR",          value: `${stats.ctrPercent.toFixed(1)}%`,           icon: BarChart2,          accent: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Conversion",   value: `${stats.conversionPercent.toFixed(1)}%`,    icon: ShoppingBag,        accent: "text-green-600",  bg: "bg-green-50" },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{s.label}</span>
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.accent}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gig breakdown table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">Gig Breakdown</h2>
        </div>
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
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id} className="border-border hover:bg-surface-subtle">
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
