"use client"

import { useFormContext } from "react-hook-form"
import { ImageUpload } from "@/components/ui/image-upload"
import type { GigGalleryData } from "@/schemas/client/gigs"

interface UploadedImage { url: string; path: string }

export function Step4Gallery() {
  const { watch, setValue } = useFormContext<GigGalleryData>()

  const coverUrl    = watch("coverImageUrl") ?? ""
  const galleryUrls = watch("galleryImages") ?? []

  // Paths live alongside URLs — stored in hidden non-schema fields on the form
  const coverPath    = (watch as any)("_coverPath")    as string | undefined
  const galleryPaths = ((watch as any)("_galleryPaths") as string[] | undefined) ?? []

  function handleCoverChange(img: UploadedImage | null) {
    setValue("coverImageUrl", img?.url ?? "")
    ;(setValue as any)("_coverPath", img?.path ?? "")
  }

  function handleGalleryChange(index: number, img: UploadedImage | null) {
    const newUrls  = [...galleryUrls]
    const newPaths = [...galleryPaths]

    if (img) {
      newUrls[index]  = img.url
      newPaths[index] = img.path
    } else {
      newUrls.splice(index, 1)
      newPaths.splice(index, 1)
    }

    setValue("galleryImages", newUrls)
    ;(setValue as any)("_galleryPaths", newPaths)
  }

  const slots: (UploadedImage | null)[] = [0, 1, 2].map(i =>
    galleryUrls[i] ? { url: galleryUrls[i], path: galleryPaths[i] ?? "" } : null
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Gallery</h2>
        <p className="text-sm text-text-secondary">
          Add images to showcase your work. A great cover image increases clicks.
        </p>
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-text-primary">Cover Image</p>
          <span className="text-xs text-danger-500">*</span>
          <span className="text-xs text-text-tertiary ml-auto">16:9 recommended</span>
        </div>
        <ImageUpload
          value={coverUrl ? { url: coverUrl, path: coverPath ?? "" } : null}
          onChange={handleCoverChange}
          folder="gigs/covers"
          aspectRatio="aspect-[16/9]"
          hint="PNG, JPG or WebP · Max 3 MB · 16:9 recommended"
          className="max-w-lg"
        />
      </div>

      {/* Gallery images */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-text-primary">Additional Images</p>
          <span className="text-xs text-text-tertiary">(up to 3, optional)</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot, i) => (
            <ImageUpload
              key={i}
              value={slot}
              onChange={img => handleGalleryChange(i, img)}
              folder="gigs/gallery"
              aspectRatio="aspect-[4/3]"
              hint="PNG, JPG or WebP · Max 3 MB"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
