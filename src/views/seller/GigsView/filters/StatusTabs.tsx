"use client"

import { cn } from "@/lib/utils"

const TABS = [
  { label: "All",    value: "" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Draft",  value: "draft" },
]

interface StatusTabsProps {
  value:    string
  onChange: (value: string) => void
  counts?:  Record<string, number>
}

export function StatusTabs({ value, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
            value === tab.value
              ? "bg-white text-text-primary shadow-sm border border-border"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {tab.label}
          {counts && counts[tab.value] !== undefined && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-medium",
              value === tab.value ? "bg-brand-50 text-brand-700" : "bg-border text-text-tertiary"
            )}>
              {counts[tab.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
