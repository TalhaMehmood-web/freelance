"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Star, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { cn, formatCurrency, formatRating, formatNumber, getInitials } from "@/lib/shared/utils"
import { GigGallery } from "./GigGallery"
import { GigPackageSelector } from "./GigPackageSelector"
import { GigFAQ } from "./GigFAQ"
import { SellerSidebar } from "./SellerSidebar"
import type { GigDetail } from "@/types/gigs"

interface GigDetailViewProps {
  gig: GigDetail
}

type ActiveTab = "overview" | "reviews"

export function GigDetailView({ gig }: GigDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview")

  return (
    <div className="relative min-h-screen bg-surface-subtle">
      {/* Decorative blobs + dot pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-brand-50/60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, var(--color-brand-400) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-text-tertiary mb-6 flex-wrap">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/gigs" className="hover:text-brand-500 transition-colors">Services</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link
            href={`/gigs?category=${gig.category.slug}`}
            className="hover:text-brand-500 transition-colors"
          >
            {gig.category.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-text-secondary truncate max-w-48">{gig.title}</span>
          <span className="ml-auto bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full border border-brand-100 shrink-0">
            Starting at {formatCurrency(gig.startingPriceCents)}
          </span>
        </nav>

        {/* 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: main content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-2xl font-bold text-text-primary leading-tight mb-4">
              {gig.title}
            </h1>

            {/* Seller info row */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <Avatar className="h-9 w-9">
                <AvatarImage src={gig.seller.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
                  {getInitials(gig.seller.fullName)}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/freelancers/${gig.seller.username}`}
                className="text-sm font-medium text-text-primary hover:text-brand-500 transition-colors"
              >
                {gig.seller.fullName}
              </Link>
              <SellerLevelBadge level={gig.seller.sellerLevel} />
              {gig.reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
                  <span className="text-sm font-semibold text-text-primary">
                    {formatRating(gig.avgRating)}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    ({formatNumber(gig.reviewCount)})
                  </span>
                </div>
              )}
              <span className="text-xs text-text-tertiary">{formatNumber(gig.orderCount)} orders</span>
              {gig.inQueue > 0 && (
                <span className="text-xs text-warning-500 bg-warning-100 px-2 py-0.5 rounded-full font-medium">
                  {gig.inQueue} in queue
                </span>
              )}
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <GigGallery images={gig.images} title={gig.title} />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              {(["overview", "reviews"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px rounded-none h-auto hover:bg-transparent",
                    activeTab === tab
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  )}
                >
                  {tab}
                  {tab === "reviews" && gig.reviewCount > 0 && (
                    <span className="ml-1.5 text-xs bg-surface-muted px-1.5 py-0.5 rounded-full text-text-tertiary">
                      {formatNumber(gig.reviewCount)}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-base font-semibold text-text-primary mb-3">
                    About This Service
                  </h2>
                  <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {gig.description}
                  </div>
                </div>

                {gig.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {gig.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {gig.faqs.length > 0 && (
                  <div>
                    <h2 className="text-base font-semibold text-text-primary mb-4">
                      Frequently Asked Questions
                    </h2>
                    <GigFAQ faqs={gig.faqs} />
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-7 w-7 text-brand-300" />
                </div>
                <p className="text-sm text-text-secondary">Reviews coming soon.</p>
              </div>
            )}
          </div>

          {/* RIGHT: sticky sidebar */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="lg:sticky lg:top-6 space-y-5">
              <GigPackageSelector packages={gig.packages} />
              <SellerSidebar seller={gig.seller} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
