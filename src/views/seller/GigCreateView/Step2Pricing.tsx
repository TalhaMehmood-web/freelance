"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { cn, formatCurrency } from "@/lib/shared/utils"
import type { GigPricingData } from "@/schemas/client/gigs"

type PackageName = "basic" | "standard" | "premium"

const PACKAGE_META: Record<PackageName, { label: string; color: string; description: string }> = {
  basic:    { label: "Basic",    color: "text-text-secondary",  description: "Entry-level package" },
  standard: { label: "Standard", color: "text-brand-600",       description: "Most popular package" },
  premium:  { label: "Premium",  color: "text-accent-600",      description: "All-inclusive package" },
}

interface PackagePanelProps {
  name: PackageName
}

function PackagePanel({ name }: PackagePanelProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<GigPricingData>()
  const meta    = PACKAGE_META[name]
  const enabled = watch(`${name}.enabled`)
  const errs    = errors[name]

  return (
    <div className={cn(
      "bg-surface rounded-2xl border shadow-card transition-all",
      enabled ? "border-brand-200" : "border-border opacity-60"
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className={cn("text-sm font-bold", meta.color)}>{meta.label}</p>
          <p className="text-xs text-text-tertiary">{meta.description}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => setValue(`${name}.enabled`, v, { shouldValidate: true })}
          aria-label={`Enable ${meta.label} package`}
        />
      </div>

      {enabled && (
        <div className="px-5 py-4 space-y-4">
          {/* Package name */}
          <div className="space-y-1.5">
            <Label htmlFor={`${name}-name`} className="text-xs font-medium">Package Name</Label>
            <Input
              id={`${name}-name`}
              placeholder={`e.g. ${meta.label} Plan`}
              maxLength={60}
              aria-invalid={!!errs?.name}
              {...register(`${name}.name`)}
            />
            {errs?.name && <p className="text-xs text-danger-600">{errs.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor={`${name}-desc`} className="text-xs font-medium">Short Description</Label>
            <Input
              id={`${name}-desc`}
              placeholder="What's included in this package…"
              maxLength={300}
              aria-invalid={!!errs?.description}
              {...register(`${name}.description`)}
            />
            {errs?.description && <p className="text-xs text-danger-600">{errs.description.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor={`${name}-price`} className="text-xs font-medium">Price ($)</Label>
              <Input
                id={`${name}-price`}
                type="number"
                min={5}
                placeholder="50"
                aria-invalid={!!errs?.priceCents}
                {...register(`${name}.priceCents`, {
                  setValueAs: (v) => Math.round(parseFloat(String(v) || "0") * 100),
                })}
              />
              {errs?.priceCents && <p className="text-xs text-danger-600">{errs.priceCents.message}</p>}
            </div>

            {/* Delivery days */}
            <div className="space-y-1.5">
              <Label htmlFor={`${name}-days`} className="text-xs font-medium">Delivery (days)</Label>
              <Input
                id={`${name}-days`}
                type="number"
                min={1}
                max={365}
                placeholder="7"
                aria-invalid={!!errs?.deliveryDays}
                {...register(`${name}.deliveryDays`, { valueAsNumber: true })}
              />
              {errs?.deliveryDays && <p className="text-xs text-danger-600">{errs.deliveryDays.message}</p>}
            </div>

            {/* Revisions */}
            <div className="space-y-1.5">
              <Label htmlFor={`${name}-revisions`} className="text-xs font-medium">Revisions</Label>
              <Input
                id={`${name}-revisions`}
                type="number"
                min={0}
                max={99}
                placeholder="2"
                aria-invalid={!!errs?.revisions}
                {...register(`${name}.revisions`, { valueAsNumber: true })}
              />
              {errs?.revisions && <p className="text-xs text-danger-600">{errs.revisions.message}</p>}
            </div>
          </div>

          {watch(`${name}.priceCents`) > 0 && (
            <p className="text-xs text-text-tertiary text-right">
              Buyer pays: {formatCurrency(watch(`${name}.priceCents`))} · You earn: {formatCurrency(Math.round(watch(`${name}.priceCents`) * 0.8))} (after 20% fee)
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function Step2Pricing() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Pricing & Packages</h2>
        <p className="text-sm text-text-secondary">
          Set up to 3 packages. Enable at least one to continue.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <PackagePanel name="basic" />
        <PackagePanel name="standard" />
        <PackagePanel name="premium" />
      </div>
    </div>
  )
}
