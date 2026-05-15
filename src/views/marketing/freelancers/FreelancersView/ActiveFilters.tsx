"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FreelancerFilters } from "./types"

const SELLER_LEVEL_LABELS: Record<string, string> = {
  top_rated: "Top Rated",
  level_2:   "Level 2",
  level_1:   "Level 1",
  new:       "New Seller",
}

const AVAILABILITY_LABELS: Record<string, string> = {
  available: "Available",
  busy:      "Busy",
}

interface ActiveFiltersProps {
  filters: FreelancerFilters
  categories: { name: string; slug: string }[]
  onRemove: (key: keyof FreelancerFilters) => void
}

export function ActiveFilters({ filters, categories, onRemove }: ActiveFiltersProps) {
  const pills: { key: keyof FreelancerFilters; label: string }[] = []

  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category)
    if (cat) pills.push({ key: "category", label: cat.name })
  }
  if (filters.sellerLevel) {
    pills.push({ key: "sellerLevel", label: SELLER_LEVEL_LABELS[filters.sellerLevel] ?? filters.sellerLevel })
  }
  if (filters.minRating) {
    pills.push({ key: "minRating", label: `${filters.minRating}+ stars` })
  }
  if (filters.minHourlyRate || filters.maxHourlyRate) {
    const label = filters.minHourlyRate && filters.maxHourlyRate
      ? `$${filters.minHourlyRate}–$${filters.maxHourlyRate}/hr`
      : filters.minHourlyRate
      ? `Min $${filters.minHourlyRate}/hr`
      : `Max $${filters.maxHourlyRate}/hr`
    pills.push({ key: "minHourlyRate", label })
  }
  if (filters.availability) {
    pills.push({ key: "availability", label: AVAILABILITY_LABELS[filters.availability] ?? filters.availability })
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
