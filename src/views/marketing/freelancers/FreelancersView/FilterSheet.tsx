"use client"

import { useState } from "react"
import { SlidersHorizontal, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/shared/utils"
import type { FreelancerFilters } from "./types"

const SELLER_LEVEL_OPTIONS = [
  { label: "Any",        value: "" },
  { label: "Top Rated",  value: "top_rated" },
  { label: "Level 2",    value: "level_2" },
  { label: "Level 1",    value: "level_1" },
  { label: "New Seller", value: "new" },
]

const RATING_OPTIONS = [
  { label: "Any",  value: "" },
  { label: "3.5+", value: "3.5" },
  { label: "4.0+", value: "4.0" },
  { label: "4.5+", value: "4.5" },
]

const AVAILABILITY_OPTIONS = [
  { label: "Any",       value: "" },
  { label: "Available", value: "available" },
  { label: "Busy",      value: "busy" },
]

interface ChipGroupProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  withStar?: boolean
}

function ChipGroup({ options, value, onChange, withStar }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-9 rounded-full border text-sm transition-all gap-1.5",
            value === opt.value
              ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold hover:bg-brand-50"
              : "border-border text-text-secondary hover:border-brand-300 hover:bg-transparent"
          )}
        >
          {withStar && opt.value && (
            <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500 shrink-0" />
          )}
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FreelancerFilters
  categories: { name: string; slug: string }[]
  onApply: (filters: FreelancerFilters) => void
  onReset: () => void
  activeCount: number
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  categories,
  onApply,
  onReset,
  activeCount,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<FreelancerFilters>(filters)

  function update<K extends keyof FreelancerFilters>(key: K, value: FreelancerFilters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function handleOpen(next: boolean) {
    if (next) setDraft(filters)
    onOpenChange(next)
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  function handleClear() {
    const cleared: FreelancerFilters = {
      q: filters.q,
      category: "",
      sellerLevel: "",
      minRating: "",
      minHourlyRate: "",
      maxHourlyRate: "",
      availability: "",
      sort: filters.sort,
    }
    setDraft(cleared)
    onReset()
    onOpenChange(false)
  }

  const draftActiveCount = [
    draft.category,
    draft.sellerLevel,
    draft.minRating,
    draft.minHourlyRate || draft.maxHourlyRate,
    draft.availability,
  ].filter(Boolean).length

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-500" />
              Filters
              {draftActiveCount > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                  {draftActiveCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" className="text-text-tertiary" />
              }
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* Category */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => update("category", "")}
                className={cn(
                  "h-9 rounded-full border text-sm transition-all",
                  !draft.category
                    ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold hover:bg-brand-50"
                    : "border-border text-text-secondary hover:border-brand-300 hover:bg-transparent"
                )}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.slug}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => update("category", cat.slug)}
                  className={cn(
                    "h-9 rounded-full border text-sm transition-all",
                    draft.category === cat.slug
                      ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold hover:bg-brand-50"
                      : "border-border text-text-secondary hover:border-brand-300 hover:bg-transparent"
                  )}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Seller Level */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Seller Level</p>
            <ChipGroup
              options={SELLER_LEVEL_OPTIONS}
              value={draft.sellerLevel}
              onChange={(v) => update("sellerLevel", v)}
            />
          </div>

          <Separator />

          {/* Hourly Rate */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Hourly Rate</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="fl-minRate" className="text-xs text-text-tertiary mb-1.5 block">
                  Min ($/hr)
                </Label>
                <Input
                  id="fl-minRate"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={draft.minHourlyRate}
                  onChange={(e) => update("minHourlyRate", e.target.value)}
                  className="h-10"
                />
              </div>
              <span className="text-text-tertiary pb-2.5 shrink-0">—</span>
              <div className="flex-1">
                <Label htmlFor="fl-maxRate" className="text-xs text-text-tertiary mb-1.5 block">
                  Max ($/hr)
                </Label>
                <Input
                  id="fl-maxRate"
                  type="number"
                  min={0}
                  placeholder="Any"
                  value={draft.maxHourlyRate}
                  onChange={(e) => update("maxHourlyRate", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Minimum Rating */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Minimum Rating</p>
            <ChipGroup
              options={RATING_OPTIONS}
              value={draft.minRating}
              onChange={(v) => update("minRating", v)}
              withStar
            />
          </div>

          <Separator />

          {/* Availability */}
          <div>
            <p className="text-sm font-semibold text-text-primary mb-3">Availability</p>
            <ChipGroup
              options={AVAILABILITY_OPTIONS}
              value={draft.availability}
              onChange={(v) => update("availability", v)}
            />
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border bg-surface-subtle gap-3 flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClear}>
            Clear all
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Show results
            {draftActiveCount > 0 && (
              <span className="ml-1.5 text-xs opacity-80">· {draftActiveCount} active</span>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
