"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, SlidersHorizontal } from "lucide-react"
import { GigCard } from "@/components/gigs/GigCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatNumber } from "@/lib/shared/utils"
import { FilterSheet } from "./FilterSheet"
import { ActiveFilters } from "./ActiveFilters"
import type { GigFilters } from "./types"
import type { GigCard as GigCardType } from "@/types/gigs"

const SORT_OPTIONS = [
  { label: "Best Match",         value: "relevance" },
  { label: "Best Selling",       value: "orders" },
  { label: "Newest",             value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated",          value: "rating" },
]

interface GigsViewProps {
  gigs: GigCardType[]
  total: number
  filters: GigFilters
  categories: { name: string; slug: string }[]
}

export function GigsView({ gigs, total, filters: initialFilters, categories }: GigsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  useSearchParams()
  const [, startTransition] = useTransition()
  const [filters, setFilters] = useState<GigFilters>(initialFilters)
  const [sheetOpen, setSheetOpen] = useState(false)

  const pushFilters = useCallback(
    (next: GigFilters) => {
      const params = new URLSearchParams()
      Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v) })
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [pathname, router]
  )

  const handleFilterChange = useCallback(
    (key: keyof GigFilters, value: string) => {
      const next = { ...filters, [key]: value }
      setFilters(next)
      pushFilters(next)
    },
    [filters, pushFilters]
  )

  const handleApply = useCallback(
    (next: GigFilters) => {
      setFilters(next)
      pushFilters(next)
    },
    [pushFilters]
  )

  const handleReset = useCallback(() => {
    const next: GigFilters = {
      q: filters.q,
      category: "",
      minPrice: "",
      maxPrice: "",
      deliveryDays: "",
      sellerLevel: "",
      minRating: "",
      sort: filters.sort,
    }
    setFilters(next)
    pushFilters(next)
  }, [filters.q, filters.sort, pushFilters])

  const handleRemoveFilter = useCallback(
    (key: keyof GigFilters) => {
      const next = { ...filters }
      if (key === "minPrice") {
        next.minPrice = ""
        next.maxPrice = ""
      } else {
        next[key] = key === "sort" ? "relevance" : ""
      }
      setFilters(next)
      pushFilters(next)
    },
    [filters, pushFilters]
  )

  const activeFilterCount = [
    filters.category,
    filters.minPrice || filters.maxPrice,
    filters.deliveryDays,
    filters.sellerLevel,
    filters.minRating,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          {filters.q ? (
            <>Results for <span className="text-brand-500">&ldquo;{filters.q}&rdquo;</span></>
          ) : filters.category ? (
            categories.find((c) => c.slug === filters.category)?.name ?? "Browse Gigs"
          ) : (
            "Browse Gigs"
          )}
        </h1>
        <p className="text-sm text-text-secondary">
          {formatNumber(total)} service{total !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none z-10" />
        <Input
          type="search"
          defaultValue={filters.q}
          placeholder="Search services…"
          className="h-11 pl-10 pr-4 text-sm rounded-xl shadow-card"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFilterChange("q", (e.target as HTMLInputElement).value.trim())
            }
          }}
        />
      </div>

      {/* Toolbar: Filters button + Sort */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="h-10 gap-2 rounded-xl border-border hover:border-brand-300 hover:bg-brand-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-text-secondary hidden sm:block">Sort by:</span>
          <Select value={filters.sort} onValueChange={(v) => v && handleFilterChange("sort", v)}>
            <SelectTrigger className="h-10 text-sm rounded-xl min-w-44 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter pills */}
      <ActiveFilters filters={filters} categories={categories} onRemove={handleRemoveFilter} />

      {/* Results grid */}
      {gigs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-brand-300" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">No gigs found</h3>
          <p className="text-sm text-text-secondary mb-6 max-w-sm">
            Try adjusting your filters or search terms to find what you&apos;re looking for.
          </p>
          <Button variant="outline" onClick={handleReset}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}

      {/* Filter Sheet */}
      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        categories={categories}
        onApply={handleApply}
        onReset={handleReset}
        activeCount={activeFilterCount}
      />
    </div>
  )
}
