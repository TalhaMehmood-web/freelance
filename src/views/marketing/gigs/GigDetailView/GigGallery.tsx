"use client"

import { useState, useCallback } from "react"
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useEffect } from "react"
import { cn } from "@/lib/shared/utils"
import DImage from "@/components/ui/d-image"
import type { GigImage } from "@/types/gigs"

interface GigGalleryProps {
  images: GigImage[]
  title:  string
}

export function GigGallery({ images, title }: GigGalleryProps) {
  const [activeIndex,  setActiveIndex]  = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [api,          setApi]          = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return
    api.on("select", () => setActiveIndex(api.selectedScrollSnap()))
  }, [api])

  const scrollTo = useCallback((i: number) => api?.scrollTo(i), [api])

  /* ── Empty state ── */
  if (images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border shadow-card">
        <div className="relative aspect-video bg-linear-to-br from-brand-50 to-brand-100 flex items-center justify-center">
          <span className="text-brand-200 text-7xl font-black select-none">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-border shadow-card bg-surface-muted">

        {/* Main carousel */}
        <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
          <CarouselContent>
            {images.map((img, i) => (
              <CarouselItem key={img.id}>
                <div
                  className="relative aspect-video cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                >
                  <DImage
                    src={img.imageUrl}
                    alt={`${title} — image ${i + 1}`}
                    fill
                    skipTransform
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-surface/80 backdrop-blur-sm border-border hover:bg-surface shadow-card" />
              <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-surface/80 backdrop-blur-sm border-border hover:bg-surface shadow-card" />
            </>
          )}

          {/* Counter + expand */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
            {images.length > 1 && (
              <span className="text-xs text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
                {activeIndex + 1} / {images.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-surface/70 backdrop-blur-sm border border-border hover:bg-surface transition-colors shadow-sm"
            aria-label="Expand gallery"
          >
            <Maximize2 className="h-4 w-4 text-text-secondary" />
          </button>
        </Carousel>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none bg-surface-subtle border-t border-border">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => scrollTo(i)}
                className={cn(
                  "relative flex-none w-16 h-12 rounded-lg overflow-hidden border-2 transition-all",
                  i === activeIndex
                    ? "border-brand-500 ring-2 ring-brand-200/60 shadow-sm"
                    : "border-transparent hover:border-border opacity-70 hover:opacity-100",
                )}
                aria-label={`View image ${i + 1}`}
              >
                <DImage src={img.imageUrl} alt="" fill skipTransform className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl w-full bg-black/95 border-none p-4" showCloseButton={false}>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="relative aspect-video">
            <DImage
              src={images[activeIndex]?.imageUrl ?? ""}
              alt={`${title} — image ${activeIndex + 1}`}
              fill
              skipTransform
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => { scrollTo((activeIndex - 1 + images.length) % images.length); setActiveIndex(i => (i - 1 + images.length) % images.length) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                type="button"
                onClick={() => { scrollTo((activeIndex + 1) % images.length); setActiveIndex(i => (i + 1) % images.length) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
