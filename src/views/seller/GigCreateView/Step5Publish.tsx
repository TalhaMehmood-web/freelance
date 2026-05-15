"use client"

import { CheckCircle2, Package, AlignLeft, Image, Tag } from "lucide-react"
import { cn, formatCurrency } from "@/lib/shared/utils"
import type { GigBasicsData, GigPricingData, GigDescriptionData } from "@/schemas/client/gigs"

const CATEGORIES: Record<string, string> = {
  cat_dev:     "Development & IT",
  cat_design:  "Design & Creative",
  cat_video:   "Video & Animation",
  cat_writing: "Writing & Translation",
  cat_mktg:    "Digital Marketing",
  cat_data:    "Data & Analytics",
  cat_music:   "Music & Audio",
  cat_biz:     "Business",
  cat_ai:      "AI Services",
}

interface ReviewRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  complete: boolean
}

function ReviewRow({ icon, label, value, complete }: ReviewRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
        complete ? "bg-success-100" : "bg-warning-100"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-text-primary">{value}</div>
      </div>
      {complete ? (
        <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0 mt-1" />
      ) : (
        <span className="text-xs text-warning-500 font-medium shrink-0 mt-1">Incomplete</span>
      )}
    </div>
  )
}

interface Step5PublishProps {
  basicsData: GigBasicsData | null
  pricingData: GigPricingData | null
  descriptionData: GigDescriptionData | null
}

export function Step5Publish({ basicsData, pricingData, descriptionData }: Step5PublishProps) {
  const enabledPackages = pricingData
    ? (["basic", "standard", "premium"] as const).filter((k) => pricingData[k].enabled)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Review &amp; Publish</h2>
        <p className="text-sm text-text-secondary">
          Review your gig details before publishing. You can always edit after publishing.
        </p>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-card">
        <ReviewRow
          icon={<Tag className="h-4 w-4 text-success-500" />}
          label="Overview"
          complete={!!basicsData?.title && !!basicsData?.categoryId && (basicsData?.searchTags?.length ?? 0) > 0}
          value={
            basicsData ? (
              <div>
                <p className="font-medium">{basicsData.title || "—"}</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {CATEGORIES[basicsData.categoryId] ?? basicsData.categoryId}
                  {basicsData.searchTags?.length > 0 && ` · ${basicsData.searchTags.join(", ")}`}
                </p>
              </div>
            ) : "Not completed"
          }
        />

        <ReviewRow
          icon={<Package className="h-4 w-4 text-success-500" />}
          label="Packages"
          complete={enabledPackages.length > 0}
          value={
            enabledPackages.length > 0 ? (
              <div className="flex gap-3 flex-wrap">
                {enabledPackages.map((k) => {
                  const pkg = pricingData![k]
                  return (
                    <span key={k} className="text-xs bg-surface-subtle border border-border rounded-lg px-2.5 py-1">
                      <span className="font-medium capitalize">{k}</span> — {formatCurrency(pkg.priceCents)} · {pkg.deliveryDays}d
                    </span>
                  )
                })}
              </div>
            ) : "No packages configured"
          }
        />

        <ReviewRow
          icon={<AlignLeft className="h-4 w-4 text-success-500" />}
          label="Description"
          complete={(descriptionData?.description?.length ?? 0) >= 120}
          value={
            descriptionData?.description
              ? `${descriptionData.description.slice(0, 120)}…`
              : "Not completed"
          }
        />

        <ReviewRow
          icon={<Image className="h-4 w-4 text-warning-500" />}
          label="Gallery"
          complete={false}
          value="Images can be added after publishing"
        />
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <p className="text-sm text-brand-700 leading-relaxed">
          <strong>Ready to publish?</strong> Once published, your gig will be visible in the marketplace. You&apos;ll receive an email confirmation and your seller metrics will start tracking immediately.
        </p>
      </div>
    </div>
  )
}
