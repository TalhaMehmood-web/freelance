"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GigFilters } from "./types"
import type { CategoryWithChildren } from "@/types/categories"

const DELIVERY_OPTIONS = [
  { label: "Any",       value: "" },
  { label: "24 hours",  value: "1" },
  { label: "3 days",    value: "3" },
  { label: "7 days",    value: "7" },
  { label: "14 days",   value: "14" },
]

const SELLER_LEVELS = [
  { label: "Any level",   value: "" },
  { label: "Top Rated",   value: "top_rated" },
  { label: "Level 2",     value: "level_2" },
  { label: "Level 1",     value: "level_1" },
  { label: "New Seller",  value: "new" },
]

interface ActiveFiltersProps {
  filters: GigFilters
  categories: CategoryWithChildren[]
  onRemove: (key: keyof GigFilters) => void
}

export function ActiveFilters({ filters, categories, onRemove }: ActiveFiltersProps) {
  const pills: { key: keyof GigFilters; label: string }[] = []

  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category)
    if (cat) pills.push({ key: "category", label: cat.name })
  }
  if (filters.subcategory) {
    const cat = categories.find((c) => c.slug === filters.category)
    const sub = cat?.children.find((c) => c.slug === filters.subcategory)
    if (sub) pills.push({ key: "subcategory", label: sub.name })
  }
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `$${filters.minPrice}–$${filters.maxPrice}`
      : filters.minPrice
      ? `Min $${filters.minPrice}`
      : `Max $${filters.maxPrice}`
    pills.push({ key: "minPrice", label })
  }
  if (filters.deliveryDays) {
    const opt = DELIVERY_OPTIONS.find((o) => o.value === filters.deliveryDays)
    if (opt) pills.push({ key: "deliveryDays", label: `Up to ${opt.label}` })
  }
  if (filters.sellerLevel) {
    const opt = SELLER_LEVELS.find((o) => o.value === filters.sellerLevel)
    if (opt) pills.push({ key: "sellerLevel", label: opt.label })
  }
  if (filters.minRating) {
    pills.push({ key: "minRating", label: `${filters.minRating}+ stars` })
  }

  if (pills.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {pills.map((pill) => (
        <Badge
          key={pill.key}
          variant="secondary"
          className="gap-1 pr-1.5 bg-brand-50 text-brand-700 border-brand-100"
        >
          {pill.label}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(pill.key)}
            className="h-auto w-auto p-0 hover:bg-transparent hover:text-brand-900 transition-colors"
            aria-label={`Remove ${pill.label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}
