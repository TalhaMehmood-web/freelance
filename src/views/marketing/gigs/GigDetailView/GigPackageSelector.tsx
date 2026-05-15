"use client"

import { useState } from "react"
import { Check, X, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, pluralize } from "@/lib/shared/utils"
import type { GigPackage } from "@/types/gigs"

function formatRevisions(count: number): string {
  if (count >= 99) return "Unlimited"
  return `${count} ${pluralize(count, "revision")}`
}

interface PackageColumnProps {
  pkg: GigPackage
  isSelected: boolean
  allFeatures: string[]
  onSelect: () => void
}

function PackageColumn({ pkg, isSelected, allFeatures, onSelect }: PackageColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-4 cursor-pointer transition-all",
        isSelected ? "bg-brand-50 border-t-2 border-t-brand-500" : "hover:bg-surface-subtle"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-pressed={isSelected}
    >
      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-1 capitalize">
        {pkg.packageType}
      </p>
      <p className="text-sm font-bold text-text-primary mb-0.5">{pkg.name}</p>
      <p className="text-2xl font-bold text-text-primary mb-3">{formatCurrency(pkg.priceCents)}</p>
      <p className="text-xs text-text-secondary mb-4 leading-snug flex-none">{pkg.description}</p>

      <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {pkg.deliveryDays}d delivery
        </span>
        <span className="flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          {formatRevisions(pkg.revisions)}
        </span>
      </div>

      <ul className="space-y-2 flex-1">
        {allFeatures.map((feature) => {
          const included = pkg.features.includes(feature)
          return (
            <li
              key={feature}
              className={cn(
                "flex items-start gap-2 text-xs",
                included ? "text-text-primary" : "text-text-tertiary"
              )}
            >
              {included
                ? <Check className="h-3.5 w-3.5 text-success-500 shrink-0 mt-0.5" />
                : <X className="h-3.5 w-3.5 text-text-tertiary shrink-0 mt-0.5 opacity-40" />
              }
              <span className={cn(!included && "line-through opacity-50")}>{feature}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface GigPackageSelectorProps {
  packages: GigPackage[]
}

export function GigPackageSelector({ packages }: GigPackageSelectorProps) {
  const [selectedId, setSelectedId] = useState(packages[0]?.id ?? "")

  const allFeatures = [...new Set(packages.flatMap((p) => p.features))]
  const selectedPkg = packages.find((p) => p.id === selectedId) ?? packages[0]

  if (packages.length === 0) return null

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <h3 className="text-base font-semibold text-text-primary">Select a Package</h3>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden sm:grid divide-x divide-border" style={{ gridTemplateColumns: `repeat(${packages.length}, 1fr)` }}>
        {packages.map((pkg) => (
          <PackageColumn
            key={pkg.id}
            pkg={pkg}
            isSelected={selectedId === pkg.id}
            allFeatures={allFeatures}
            onSelect={() => setSelectedId(pkg.id)}
          />
        ))}
      </div>

      {/* Mobile: tabs + single card */}
      <div className="sm:hidden">
        <div className="flex border-b border-border">
          {packages.map((pkg) => (
            <Button
              key={pkg.id}
              type="button"
              variant="ghost"
              onClick={() => setSelectedId(pkg.id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors rounded-none h-auto hover:bg-transparent",
                selectedId === pkg.id
                  ? "text-brand-600 border-b-2 border-brand-500"
                  : "text-text-secondary"
              )}
            >
              {pkg.name}
            </Button>
          ))}
        </div>
        {selectedPkg && (
          <PackageColumn
            pkg={selectedPkg}
            isSelected
            allFeatures={allFeatures}
            onSelect={() => {}}
          />
        )}
      </div>

      {/* CTA footer */}
      <div className="px-5 py-4 border-t border-border bg-surface-subtle">
        <Button className="w-full" size="lg" disabled>
          Continue — {formatCurrency(selectedPkg?.priceCents ?? 0)}
        </Button>
        <p className="text-xs text-text-tertiary text-center mt-2">
          {selectedPkg?.deliveryDays}-day delivery
          {" · "}
          {formatRevisions(selectedPkg?.revisions ?? 0)}
        </p>
      </div>
    </div>
  )
}
