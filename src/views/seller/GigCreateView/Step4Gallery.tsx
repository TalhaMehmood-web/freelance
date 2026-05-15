"use client"

import { ImagePlus, Info } from "lucide-react"

export function Step4Gallery() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Gallery</h2>
        <p className="text-sm text-text-secondary">
          Add images to showcase your work. A great cover image increases clicks.
        </p>
      </div>

      {/* Cover image upload placeholder */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">
          Cover Image <span className="text-xs text-text-tertiary font-normal">(required)</span>
        </p>
        <div className="flex items-center justify-center aspect-[16/9] max-w-lg rounded-2xl border-2 border-dashed border-border bg-surface-subtle hover:border-brand-300 hover:bg-brand-50 transition-colors cursor-pointer group">
          <div className="text-center">
            <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-200 transition-colors">
              <ImagePlus className="h-6 w-6 text-brand-500" />
            </div>
            <p className="text-sm font-medium text-text-primary">Click to upload cover image</p>
            <p className="text-xs text-text-tertiary mt-1">PNG, JPG or WebP · Max 5 MB · 16:9 recommended</p>
          </div>
        </div>
      </div>

      {/* Additional images */}
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">
          Additional Images <span className="text-xs text-text-tertiary font-normal">(up to 3, optional)</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-surface-subtle hover:border-brand-300 hover:bg-brand-50 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <ImagePlus className="h-5 w-5 text-text-tertiary mx-auto mb-1" />
                <p className="text-xs text-text-tertiary">Add image</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4">
        <Info className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
        <p className="text-xs text-brand-700 leading-relaxed">
          Image upload will be available once your account is connected to storage. For now, your gig will be published with a placeholder image. You can add images later from your seller dashboard.
        </p>
      </div>
    </div>
  )
}
