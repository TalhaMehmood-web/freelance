"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import {
  Search, ExternalLink, ShoppingBag, Clock, CheckCircle2,
  RotateCcw, XCircle, ChevronDown, X, SlidersHorizontal,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable, SortableHeader, DataTablePagination } from "@/components/ui/data-table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { useOrdersQuery, useOrderCountsQuery } from "./hooks/useOrdersQuery"
import { formatCurrency, formatDate, getInitials, cn } from "@/lib/shared/utils"
import type { SellerOrderRow } from "@/types/seller"
import type { OrdersParams } from "./hooks/useOrdersQuery"

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: "active",      label: "Active",      icon: ShoppingBag,  color: "text-blue-600"   },
  { value: "in_revision", label: "In Revision",  icon: RotateCcw,    color: "text-yellow-600" },
  { value: "delivered",   label: "Delivered",    icon: CheckCircle2, color: "text-purple-600"  },
  { value: "completed",   label: "Completed",    icon: CheckCircle2, color: "text-success-600" },
  { value: "cancelled",   label: "Cancelled",    icon: XCircle,      color: "text-danger-600"  },
  { value: "pending",     label: "Pending",      icon: Clock,        color: "text-text-tertiary" },
  { value: "disputed",    label: "Disputed",     icon: SlidersHorizontal, color: "text-orange-600" },
]

const SORT_OPTIONS = [
  { value: "createdAt-desc",  label: "Newest first"    },
  { value: "createdAt-asc",   label: "Oldest first"    },
  { value: "dueAt-asc",       label: "Due date (soonest)" },
  { value: "dueAt-desc",      label: "Due date (latest)"  },
  { value: "amountCents-desc",label: "Amount (high–low)"  },
  { value: "amountCents-asc", label: "Amount (low–high)"  },
]

const col = createColumnHelper<SellerOrderRow>()

function StatusCombobox({
  value,
  counts,
  onChange,
}: {
  value: string
  counts: Record<string, number>
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = STATUS_OPTIONS.find(s => s.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary shadow-sm hover:bg-surface-subtle transition-colors",
          value && "border-brand-300 bg-brand-50 text-brand-700"
        )}
      >
        {selected ? (
          <>
            <selected.icon className={cn("h-3.5 w-3.5", selected.color)} />
            {selected.label}
            <span className="ml-0.5 text-xs opacity-60">({counts[value] ?? 0})</span>
          </>
        ) : (
          <>
            <SlidersHorizontal className="h-3.5 w-3.5 text-text-tertiary" />
            All Statuses
          </>
        )}
        <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                value=""
                onSelect={() => { onChange(""); setOpen(false) }}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium">All Statuses</span>
                {!value && <span className="text-xs text-text-tertiary">✓</span>}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Filter by status">
              {STATUS_OPTIONS.map(opt => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => { onChange(opt.value); setOpen(false) }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <opt.icon className={cn("h-3.5 w-3.5", opt.color)} />
                    <span className="text-sm">{opt.label}</span>
                    {(counts[opt.value] ?? 0) > 0 && (
                      <span className="text-xs text-text-tertiary bg-surface-muted rounded-full px-1.5">
                        {counts[opt.value]}
                      </span>
                    )}
                  </div>
                  {value === opt.value && <span className="text-xs text-brand-500">✓</span>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandEmpty>No options found.</CommandEmpty>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function SortCombobox({
  sortBy,
  sortDir,
  onChange,
}: {
  sortBy:  string
  sortDir: string
  onChange: (by: "dueAt" | "createdAt" | "amountCents", dir: "asc" | "desc") => void
}) {
  const [open, setOpen] = useState(false)
  const current = `${sortBy}-${sortDir}`
  const label = SORT_OPTIONS.find(o => o.value === current)?.label ?? "Sort"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary shadow-sm hover:bg-surface-subtle transition-colors">
        {label}
        <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {SORT_OPTIONS.map(opt => {
                const [by, dir] = opt.value.split("-") as ["dueAt" | "createdAt" | "amountCents", "asc" | "desc"]
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => { onChange(by, dir); setOpen(false) }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{opt.label}</span>
                    {current === opt.value && <span className="text-xs text-brand-500">✓</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function SellerOrdersView() {
  const [params, setParams] = useState<OrdersParams>({
    status:  "",
    search:  "",
    page:    1,
    sortBy:  "createdAt",
    sortDir: "desc",
  })
  const [searchInput, setSearchInput] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search 350ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setParams(p => ({ ...p, search: searchInput, page: 1 }))
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  const { data, isLoading, isFetching } = useOrdersQuery(params)
  const { data: counts } = useOrderCountsQuery()

  function update(patch: Partial<OrdersParams>) {
    setParams(p => ({ ...p, ...patch, page: "page" in patch ? (patch.page ?? 1) : 1 }))
  }

  const currentSort = useMemo(() => ({
    id:   params.sortBy,
    desc: params.sortDir === "desc",
  }), [params.sortBy, params.sortDir])

  function handleSort(column: string) {
    const col = column as "dueAt" | "createdAt" | "amountCents"
    if (params.sortBy === col) {
      update({ sortDir: params.sortDir === "desc" ? "asc" : "desc" })
    } else {
      update({ sortBy: col, sortDir: "desc" })
    }
  }

  const countMap: Record<string, number> = useMemo(() => ({
    active:      counts?.active      ?? 0,
    in_revision: counts?.in_revision ?? 0,
    delivered:   counts?.delivered   ?? 0,
    completed:   counts?.completed   ?? 0,
    cancelled:   counts?.cancelled   ?? 0,
  }), [counts])

  const columns = useMemo<ColumnDef<SellerOrderRow, any>[]>(() => [
    col.display({
      id: "title",
      header: () => (
        <SortableHeader label="Order" column="createdAt" currentSort={currentSort} onSort={handleSort} />
      ),
      cell: ({ row }) => {
        const o = row.original
        return (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate max-w-55">{o.title}</p>
            <p className="text-xs text-text-tertiary font-mono mt-0.5">#{o.id.slice(-8)}</p>
          </div>
        )
      },
    }),
    col.display({
      id: "buyer",
      header: () => <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Buyer</span>,
      cell: ({ row }) => {
        const o = row.original
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={o.buyerAvatar ?? undefined} />
              <AvatarFallback className="text-[10px] font-bold bg-brand-50 text-brand-700">
                {getInitials(o.buyerName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-text-primary truncate max-w-30">{o.buyerName}</span>
          </div>
        )
      },
    }),
    col.display({
      id: "status",
      header: () => <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Status</span>,
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    }),
    col.display({
      id: "dueAt",
      header: () => (
        <SortableHeader label="Due" column="dueAt" currentSort={currentSort} onSort={handleSort} />
      ),
      cell: ({ row }) => {
        const due  = new Date(row.original.dueAt)
        const now  = new Date()
        const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000)
        const past = days < 0
        const soon = days >= 0 && days <= 2
        return (
          <div>
            <p className={cn(
              "text-sm font-medium",
              past ? "text-danger-600" : soon ? "text-accent-600" : "text-text-primary"
            )}>
              {formatDate(row.original.dueAt)}
            </p>
            {past
              ? <p className="text-xs text-danger-500">Overdue</p>
              : soon
                ? <p className="text-xs text-accent-500">{days === 0 ? "Today" : `${days}d left`}</p>
                : <p className="text-xs text-text-tertiary">{days}d left</p>
            }
          </div>
        )
      },
    }),
    col.display({
      id: "amount",
      header: () => (
        <SortableHeader label="Amount" column="amountCents" currentSort={currentSort} onSort={handleSort} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-bold text-text-primary tabular-nums">
          {formatCurrency(row.original.amountCents)}
        </span>
      ),
    }),
    col.display({
      id: "createdAt",
      header: () => <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Placed</span>,
      cell: ({ row }) => (
        <span className="text-xs text-text-tertiary">{formatDate(row.original.createdAt)}</span>
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [currentSort])

  const hasActiveFilters = params.status || params.search

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {data ? `${data.total} order${data.total !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active",      value: countMap.active,      icon: ShoppingBag,  bg: "bg-blue-50",    text: "text-blue-600"   },
          { label: "In Revision", value: countMap.in_revision, icon: RotateCcw,    bg: "bg-yellow-50",  text: "text-yellow-600" },
          { label: "Delivered",   value: countMap.delivered,   icon: CheckCircle2, bg: "bg-purple-50",  text: "text-purple-600" },
          { label: "Completed",   value: countMap.completed,   icon: CheckCircle2, bg: "bg-success-50", text: "text-success-600"},
        ].map(s => (
          <button
            key={s.label}
            onClick={() => update({ status: s.label.toLowerCase().replace(" ", "_") === params.status ? "" : STATUS_OPTIONS.find(o => o.label === s.label)?.value ?? "" })}
            className={cn(
              "bg-surface rounded-2xl border border-border shadow-card p-4 text-left transition-all hover:shadow-elevated",
              params.status === STATUS_OPTIONS.find(o => o.label === s.label)?.value
                ? "ring-2 ring-brand-300 border-brand-200"
                : ""
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{s.label}</p>
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", s.bg)}>
                <s.icon className={cn("h-3.5 w-3.5", s.text)} />
              </div>
            </div>
            <p className={cn("text-2xl font-bold", s.text)}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Debounced search */}
        <div className="relative min-w-48 max-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search orders or buyers…"
            className="pl-9 h-9 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); update({ search: "" }) }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status combobox */}
        <StatusCombobox
          value={params.status}
          counts={countMap}
          onChange={v => update({ status: v })}
        />

        {/* Sort combobox */}
        <SortCombobox
          sortBy={params.sortBy}
          sortDir={params.sortDir}
          onChange={(by, dir) => update({ sortBy: by, sortDir: dir })}
        />

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-text-tertiary hover:text-text-primary gap-1.5"
            onClick={() => { setSearchInput(""); setParams(p => ({ ...p, status: "", search: "", page: 1 })) }}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        {/* Active filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap ml-auto">
          {params.status && (
            <Badge variant="secondary" className="gap-1 text-xs pl-2 pr-1 py-1">
              {STATUS_OPTIONS.find(o => o.value === params.status)?.label ?? params.status}
              <button onClick={() => update({ status: "" })} className="ml-0.5 opacity-60 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {params.search && (
            <Badge variant="secondary" className="gap-1 text-xs pl-2 pr-1 py-1 max-w-40">
              <span className="truncate">"{params.search}"</span>
              <button onClick={() => { setSearchInput(""); update({ search: "" }) }} className="ml-0.5 opacity-60 hover:opacity-100">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data?.orders ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyMessage={hasActiveFilters ? "No orders match your filters." : "No orders yet."}
      />

      {/* Pagination */}
      {(data?.pageCount ?? 0) > 1 && (
        <DataTablePagination
          page={params.page}
          pageCount={data!.pageCount}
          total={data!.total}
          perPage={PAGE_SIZE}
          onPage={p => update({ page: p })}
        />
      )}
    </div>
  )
}
