"use client"

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const SORT_OPTIONS = [
  { value: "newest",      label: "Newest first" },
  { value: "oldest",      label: "Oldest first" },
  { value: "orders",      label: "Most orders" },
  { value: "impressions", label: "Most impressions" },
  { value: "price_asc",   label: "Price: low → high" },
  { value: "price_desc",  label: "Price: high → low" },
]

interface SortSelectProps {
  value:    string
  onChange: (value: string) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={v => v && onChange(v)}>
      <SelectTrigger className="w-44 h-8 text-sm">
        <SelectValue placeholder="Sort by…" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
