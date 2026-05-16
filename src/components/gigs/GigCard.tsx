"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Star, Heart, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import DImage from "@/components/ui/d-image"
import { formatCurrency, getInitials, formatNumber } from "@/lib/shared/utils"
import { cn } from "@/lib/shared/utils"
import type { GigCard as GigCardType } from "@/types/gigs"

interface GigCardProps {
  gig: GigCardType
  className?: string
}

export function GigCard({ gig, className }: GigCardProps) {
  const allImages = gig.images.length > 0
    ? gig.images
    : gig.coverImageUrl
      ? [{ id: "cover", imageUrl: gig.coverImageUrl }]
      : []

  const [activeIndex, setActiveIndex] = useState(0)
  const [saved, setSaved] = useState(false)

  const prev = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveIndex(i => (i - 1 + allImages.length) % allImages.length)
  }, [allImages.length])

  const next = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveIndex(i => (i + 1) % allImages.length)
  }, [allImages.length])

  const currentImage = allImages[activeIndex]

  return (
    <article
      className={cn(
        "group relative bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300",
        className
      )}
    >
      {/* Image area */}
      <Link href={`/gigs/${gig.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {currentImage ? (
          <DImage
            src={currentImage.imageUrl}
            alt={gig.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-brand-300 text-5xl font-bold select-none">
              {gig.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Carousel controls */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/90 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/90 backdrop-blur-sm shadow-md flex items-center justify-center text-text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(i) }}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === activeIndex
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/60 hover:bg-white/80"
                  )}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Featured badge */}
        {gig.isFeatured && (
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10">
            <Zap className="h-2.5 w-2.5 fill-white" />
            Featured
          </span>
        )}

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); setSaved(s => !s) }}
          className={cn(
            "absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm shadow transition-all z-10",
            saved
              ? "bg-danger-500 text-white opacity-100"
              : "bg-surface/80 text-text-secondary hover:text-danger-500 opacity-0 group-hover:opacity-100"
          )}
          aria-label={saved ? "Unsave gig" : "Save gig"}
        >
          <Heart className={cn("h-3.5 w-3.5", saved && "fill-white")} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3.5">
        {/* Seller row */}
        <div className="flex items-center gap-2 mb-2.5">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={gig.seller.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[9px] bg-brand-100 text-brand-700 font-semibold">
              {getInitials(gig.seller.fullName)}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/freelancers/${gig.seller.username}`}
            className="text-xs font-medium text-text-secondary hover:text-brand-500 transition-colors truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {gig.seller.fullName}
          </Link>
          <SellerLevelBadge level={gig.seller.sellerLevel} />
          {gig.seller.country && (
            <span className="text-[10px] text-text-tertiary ml-auto shrink-0">{gig.seller.country}</span>
          )}
        </div>

        {/* Title */}
        <Link href={`/gigs/${gig.slug}`}>
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 hover:text-brand-500 transition-colors mb-2.5 min-h-10">
            {gig.title}
          </h3>
        </Link>

        {/* Rating + category row */}
        <div className="flex items-center gap-2 flex-wrap">
          {gig.reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent-500 text-accent-500 shrink-0" />
              <span className="text-xs font-bold text-text-primary">{gig.avgRating.toFixed(1)}</span>
              <span className="text-[10px] text-text-tertiary">({formatNumber(gig.reviewCount)})</span>
            </div>
          ) : (
            <span className="text-[10px] text-text-tertiary">No reviews yet</span>
          )}
          <span className="text-[10px] text-text-tertiary bg-surface-subtle border border-border rounded-full px-2 py-0.5 ml-auto truncate max-w-24">
            {gig.category.name}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3.5 py-2.5 border-t border-border flex items-center justify-between bg-surface-subtle/50">
        <span className="text-[10px] text-text-tertiary uppercase tracking-wide font-medium">Starting at</span>
        <span className="text-sm font-bold text-text-primary">
          {formatCurrency(gig.startingPriceCents)}
        </span>
      </div>
    </article>
  )
}
