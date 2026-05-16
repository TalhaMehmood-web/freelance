"use client"

import { useState } from "react"
import { MessageSquare, Star, FileText, HelpCircle } from "lucide-react"
import { cn, formatNumber } from "@/lib/shared/utils"
import { GigGallery }         from "./GigGallery"
import { GigHero }            from "./GigHero"
import { GigHighlights }      from "./GigHighlights"
import { GigDescription }     from "./GigDescription"
import { GigTags }            from "./GigTags"
import { GigFAQ }             from "./GigFAQ"
import { GigPackageSelector } from "./GigPackageSelector"
import { SellerSidebar }      from "./SellerSidebar"
import type { GigDetail } from "@/types/gigs"

type Tab = "overview" | "faq" | "reviews"

function TabBar({
  active,
  reviewCount,
  faqCount,
  onChange,
}: {
  active: Tab
  reviewCount: number
  faqCount: number
  onChange: (t: Tab) => void
}) {
  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: <FileText className="h-3.5 w-3.5" /> },
    ...(faqCount > 0
      ? [{ key: "faq" as Tab, label: `FAQ (${faqCount})`, icon: <HelpCircle className="h-3.5 w-3.5" /> }]
      : []),
    {
      key: "reviews" as Tab,
      label: reviewCount > 0 ? `Reviews (${formatNumber(reviewCount)})` : "Reviews",
      icon: <MessageSquare className="h-3.5 w-3.5" />,
    },
  ]

  return (
    <div className="flex border-b border-border">
      {tabs.map(({ key, label, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === key
              ? "border-brand-500 text-brand-600"
              : "border-transparent text-text-secondary hover:text-text-primary hover:border-border",
          )}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  )
}

function ReviewsEmpty() {
  return (
    <div className="py-12 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-3">
        <Star className="h-6 w-6 text-brand-300" />
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1">No reviews yet</p>
      <p className="text-xs text-text-secondary max-w-xs">
        Reviews will appear here once buyers rate this service.
      </p>
    </div>
  )
}

export function GigDetailView({ gig }: { gig: GigDetail }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* ── 2-col layout: left content + right sticky sidebar ─────────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Hero: back + breadcrumb + title + seller + stats */}
            <GigHero gig={gig} />

            {/* Gallery */}
            <GigGallery images={gig.images} title={gig.title} />

            {/* Highlights inline row */}
            <GigHighlights gig={gig} />

            {/* Package selector — mobile only */}
            <div className="lg:hidden">
              <GigPackageSelector packages={gig.packages} gigId={gig.id} gigTitle={gig.title} />
            </div>

            {/* Tab navigation */}
            <TabBar
              active={activeTab}
              reviewCount={gig.reviewCount}
              faqCount={gig.faqs.length}
              onChange={setActiveTab}
            />

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 pb-10">
                <GigDescription description={gig.description} />
                {gig.tags.length > 0 && <GigTags tags={gig.tags} />}
              </div>
            )}

            {/* Tab: FAQ */}
            {activeTab === "faq" && (
              <div className="pb-10">
                <GigFAQ faqs={gig.faqs} />
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === "reviews" && (
              <div className="pb-10">
                <ReviewsEmpty />
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — sticky sidebar ─────────────────────────── */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-6 space-y-4">
              <GigPackageSelector packages={gig.packages} gigId={gig.id} gigTitle={gig.title} />
              <SellerSidebar seller={gig.seller} />
            </div>
          </div>
        </div>

        {/* Mobile: seller card below content */}
        <div className="lg:hidden mt-6 pb-8">
          <SellerSidebar seller={gig.seller} />
        </div>

      </div>
    </div>
  )
}
