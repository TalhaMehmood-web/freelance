"use client"

import { useState } from "react"
import { Check, X, Clock, RefreshCw, Sparkles, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, pluralize } from "@/lib/shared/utils"
import { OrderModal } from "./OrderModal"
import { AuthButton } from "@/components/auth/AuthButton"
import type { GigPackage } from "@/types/gigs"

const PKG_COLORS: Record<string, { tab: string; card: string; price: string }> = {
  basic:    { tab: "text-text-secondary", card: "border-border",     price: "text-text-primary" },
  standard: { tab: "text-brand-600",      card: "border-brand-400 ring-2 ring-brand-100", price: "text-brand-600" },
  premium:  { tab: "text-accent-600",     card: "border-accent-300", price: "text-accent-700" },
}

function formatRevisions(n: number) {
  return n >= 99 ? "Unlimited" : `${n} ${pluralize(n, "revision")}`
}

interface GigPackageSelectorProps {
  packages: GigPackage[]
  gigId:    string
  gigTitle: string
}

export function GigPackageSelector({ packages, gigId, gigTitle }: GigPackageSelectorProps) {
  const [selectedId, setSelectedId] = useState(packages[0]?.id ?? "")
  const [modalOpen, setModalOpen]   = useState(false)
  if (packages.length === 0) return null

  const allFeatures = [...new Set(packages.flatMap((p) => p.features))]
  const selectedPkg = packages.find((p) => p.id === selectedId) ?? packages[0]
  const colors = PKG_COLORS[selectedPkg?.packageType ?? "basic"] ?? PKG_COLORS.basic

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">

      {/* Package type tabs */}
      <div className={cn(
        "grid border-b border-border",
        packages.length === 1 && "grid-cols-1",
        packages.length === 2 && "grid-cols-2",
        packages.length >= 3 && "grid-cols-3",
      )}>
        {packages.map((pkg) => {
          const c = PKG_COLORS[pkg.packageType] ?? PKG_COLORS.basic
          const isActive = selectedId === pkg.id
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedId(pkg.id)}
              className={cn(
                "relative py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
                isActive
                  ? `${c.tab} border-current bg-surface`
                  : "text-text-tertiary border-transparent hover:text-text-secondary bg-surface-subtle",
                "not-last:border-r not-last:border-r-border",
              )}
            >
              {pkg.packageType === "standard" && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full flex items-center gap-0.5 bg-brand-500 text-white text-2xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />Popular
                </span>
              )}
              {pkg.packageType}
            </button>
          )
        })}
      </div>

      {/* Selected package details */}
      {selectedPkg && (
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-xs text-text-tertiary mb-0.5">{selectedPkg.name}</p>
              <p className={cn("text-2xl font-extrabold tracking-tight", colors.price)}>
                {formatCurrency(selectedPkg.priceCents)}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary shrink-0 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand-400" />{selectedPkg.deliveryDays}d
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5 text-brand-400" />
                {selectedPkg.revisions >= 99 ? "∞" : selectedPkg.revisions}
              </span>
            </div>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed mb-4">{selectedPkg.description}</p>

          {/* Feature checklist */}
          {allFeatures.length > 0 && (
            <ul className="space-y-1.5 mb-5">
              {allFeatures.map((feature) => {
                const included = selectedPkg.features.includes(feature)
                return (
                  <li key={feature} className={cn("flex items-center gap-2 text-xs", included ? "text-text-primary" : "text-text-tertiary/50")}>
                    {included
                      ? <Check className="h-3.5 w-3.5 text-success-500 shrink-0" />
                      : <X className="h-3.5 w-3.5 shrink-0 opacity-30" />
                    }
                    <span className={cn(!included && "line-through opacity-40")}>{feature}</span>
                  </li>
                )
              })}
            </ul>
          )}

          <AuthButton>
            <Button className="w-full gap-2" size="sm" onClick={() => setModalOpen(true)}>
              <ShoppingCart className="h-3.5 w-3.5" />
              Continue — {formatCurrency(selectedPkg.priceCents)}
            </Button>
          </AuthButton>
          <p className="text-2xs text-text-tertiary text-center mt-1.5">
            {formatRevisions(selectedPkg.revisions)} · {selectedPkg.deliveryDays}-day delivery
          </p>

          <OrderModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            pkg={selectedPkg}
            gigId={gigId}
            gigTitle={gigTitle}
          />
        </div>
      )}
    </div>
  )
}
