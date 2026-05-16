"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Search, Star, Pause, Play, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DImage from "@/components/ui/d-image"
import { formatCurrency, formatNumber, formatRating } from "@/lib/shared/utils"
import { useGigModerationQuery } from "./hooks/useGigModerationQuery"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const SearchSchema = z.object({ search: z.string() })
type SearchForm = z.infer<typeof SearchSchema>

const STATUS_TABS = [
  { label: "All",       value: "" },
  { label: "Active",    value: "active" },
  { label: "Paused",    value: "paused" },
  { label: "Draft",     value: "draft" },
]

const STATUS_BADGE: Record<string, string> = {
  active:  "bg-success-50 text-success-700 border-success-200",
  paused:  "bg-warning-50 text-warning-700 border-warning-200",
  draft:   "bg-surface-muted text-text-tertiary border-border",
}

function SortBtn({ col, label, currentSort, currentDir, onClick }: {
  col:        string
  label:      string
  currentSort: string
  currentDir:  string
  onClick:    () => void
}) {
  const isActive = currentSort === col
  return (
    <button
      type="button"
      className="flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors"
      onClick={onClick}
    >
      {label}
      {isActive
        ? currentDir === "asc"
          ? <ArrowUp   className="w-3.5 h-3.5" />
          : <ArrowDown className="w-3.5 h-3.5" />
        : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
      }
    </button>
  )
}

export function GigModerationView() {
  const { query, navigate, search, status, sortBy, sortDir, page, toggleMutation } =
    useGigModerationQuery()

  const [, startTransition] = useTransition()

  const searchForm = useForm<SearchForm>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { search },
  })

  function handleSort(col: string) {
    const isActive = sortBy === col
    const next = isActive && sortDir === "asc" ? "desc" : "asc"
    navigate({ sortBy: col, sortDir: next })
  }

  function handleToggle(gigId: string, currentStatus: string) {
    const next = currentStatus === "active" ? "paused" : "active"
    startTransition(() => {
      toggleMutation.mutate({ gigId, next: next as "active" | "paused" })
    })
  }

  const gigs      = query.data?.data      ?? []
  const total     = query.data?.total     ?? 0
  const pageCount = query.data?.pageCount ?? 1

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Gig Moderation</h1>
        <p className="text-sm text-text-secondary mt-1">{total} gigs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={searchForm.handleSubmit(({ search: s }) => navigate({ search: s || undefined }))}
          className="relative flex-1 min-w-48 max-w-xs"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <Input placeholder="Search gigs…" {...searchForm.register("search")} className="pl-9" />
        </form>

        <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => navigate({ status: tab.value || undefined })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === tab.value
                  ? "bg-white text-text-primary shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-surface-subtle border-b border-border text-xs">
          <SortBtn col="title"       label="Gig"      currentSort={sortBy} currentDir={sortDir} onClick={() => handleSort("title")} />
          <span className="font-medium text-text-secondary">Seller</span>
          <SortBtn col="totalOrders" label="Orders"   currentSort={sortBy} currentDir={sortDir} onClick={() => handleSort("totalOrders")} />
          <SortBtn col="avgRating"   label="Rating"   currentSort={sortBy} currentDir={sortDir} onClick={() => handleSort("avgRating")} />
          <SortBtn col="createdAt"   label="Created"  currentSort={sortBy} currentDir={sortDir} onClick={() => handleSort("createdAt")} />
          <span className="font-medium text-text-secondary text-right">Actions</span>
        </div>

        {query.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
          </div>
        ) : gigs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-text-secondary">
            <p className="font-medium">No gigs found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {gigs.map(gig => (
              <div
                key={gig.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-surface-subtle transition-colors"
              >
                {/* Gig */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-10 rounded-lg overflow-hidden bg-brand-50 border border-border shrink-0">
                    {gig.coverImageUrl ? (
                      <DImage src={gig.coverImageUrl} alt="" skipTransform className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-300 font-bold">
                        {gig.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary text-sm truncate">{gig.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className={`text-xs ${STATUS_BADGE[gig.status] ?? ""}`}>
                        {gig.status}
                      </Badge>
                      <span className="text-xs text-text-tertiary">{formatCurrency(gig.startingPriceCents)}</span>
                    </div>
                  </div>
                </div>

                {/* Seller */}
                <Link
                  href={`/admin/users/${gig.seller.userId}`}
                  className="flex items-center gap-2 min-w-0 group"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-brand-50 border border-border shrink-0">
                    {gig.seller.avatarUrl ? (
                      <DImage src={gig.seller.avatarUrl} alt="" skipTransform className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-400 text-xs font-bold">
                        {gig.seller.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors truncate">
                      {gig.seller.fullName}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">@{gig.seller.username}</p>
                  </div>
                </Link>

                {/* Orders */}
                <span className="text-sm text-text-secondary">{formatNumber(gig.totalOrders)}</span>

                {/* Rating */}
                <span className="text-sm text-text-secondary flex items-center gap-1">
                  {gig.reviewCount > 0 ? (
                    <>
                      <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
                      {formatRating(gig.avgRating)}
                    </>
                  ) : "—"}
                </span>

                {/* Created */}
                <span className="text-xs text-text-tertiary whitespace-nowrap">
                  {new Date(gig.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="View public page"
                    render={<Link href={`/gigs/${gig.slug}`} target="_blank" />}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  {(gig.status === "active" || gig.status === "paused") && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={gig.status === "active" ? "Pause" : "Activate"}
                      onClick={() => handleToggle(gig.id, gig.status)}
                      disabled={toggleMutation.isPending}
                    >
                      {gig.status === "active"
                        ? <Pause className="w-3.5 h-3.5 text-warning-600" />
                        : <Play  className="w-3.5 h-3.5 text-success-600" />
                      }
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>Page {page} of {pageCount} · {total} gigs</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              disabled={page <= 1}
              onClick={() => navigate({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={page >= pageCount}
              onClick={() => navigate({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
