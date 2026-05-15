"use client"

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const OPTIONS = [5, 10, 20, 50]

interface PerPageSelectProps {
  value:    number
  onChange: (value: number) => void
}

export function PerPageSelect({ value, onChange }: PerPageSelectProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <span>Show</span>
      <Select value={String(value)} onValueChange={v => v && onChange(Number(v))}>
        <SelectTrigger className="w-16 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map(n => (
            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>per page</span>
    </div>
  )
}
