"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/shared/utils"
import type { GigImage } from "@/types/gigs"

interface GigGalleryProps {
  images: GigImage[]
  title: string
}

export function GigGallery({ images, title }: GigGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const goToPrev = useCallback(
    () => setActiveIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  )
  const goToNext = useCallback(
    () => setActiveIndex((i) => (i + 1) % images.length),
    [images.length]
  )

  if (images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="relative aspect-[16/10] bg-linear-to-br from-brand-50 to-brand-100 flex items-center justify-center">
          <span className="text-brand-300 text-6xl font-bold select-none">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-border bg-surface-muted">
        {/* Main image */}
        <div
          className="relative aspect-[16/10] cursor-zoom-in select-none"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={images[activeIndex].imageUrl}
            alt={`${title} — image ${activeIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => { e.stopPropagation(); goToPrev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 backdrop-blur-sm shadow-card hover:bg-surface transition-colors h-auto w-auto"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-text-primary" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/80 backdrop-blur-sm shadow-card hover:bg-surface transition-colors h-auto w-auto"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-text-primary" />
              </Button>

              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full pointer-events-none">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}

          <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-surface/70 backdrop-blur-sm pointer-events-none">
            <Maximize2 className="h-4 w-4 text-text-secondary" />
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
            {images.map((img, i) => (
              <Button
                key={img.id}
                type="button"
                variant="ghost"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative flex-none w-16 h-12 rounded-lg overflow-hidden border-2 transition-all p-0",
                  i === activeIndex
                    ? "border-brand-500 ring-2 ring-brand-200"
                    : "border-transparent hover:border-border hover:bg-transparent"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img.imageUrl} alt="" fill className="object-cover" sizes="64px" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-5xl w-full bg-black/95 border-none p-4"
          showCloseButton={false}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors h-auto w-auto"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5 text-white" />
          </Button>

          <div className="relative aspect-[16/10]">
            <Image
              src={images[activeIndex]?.imageUrl ?? ""}
              alt={`${title} — image ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors h-auto w-auto"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors h-auto w-auto"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </Button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
