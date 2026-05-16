"use client"

import { useRef } from "react"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { ImagePlus, X, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import DImage from "@/components/ui/d-image"

interface UploadedImage {
  url:  string
  path: string
}

interface ImageUploadProps {
  value?:       UploadedImage | null
  onChange:     (image: UploadedImage | null) => void
  folder?:      string
  accept?:      string
  aspectRatio?: string
  hint?:        string
  className?:   string
  disabled?:    boolean
}

export function ImageUpload({
  value,
  onChange,
  folder      = "uploads",
  accept      = "image/jpeg,image/png,image/webp",
  aspectRatio = "aspect-[4/3]",
  hint        = "PNG, JPG or WebP · Max 3 MB",
  className,
  disabled    = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append("file",   file)
      form.append("folder", folder)
      const { data } = await axios.post<{ url: string; path: string }>("/api/upload", form)
      return data
    },
    onSuccess: (data) => onChange({ url: data.url, path: data.path }),
  })

  const removeMutation = useMutation({
    mutationFn: async (path: string) => {
      await axios.delete("/api/upload", { data: { path } })
    },
    onSuccess: () => {
      onChange(null)
      if (inputRef.current) inputRef.current.value = ""
    },
  })

  function handleFile(file: File) {
    uploadMutation.reset()
    uploadMutation.mutate(file)
  }

  function handleRemove() {
    if (!value) return
    removeMutation.reset()
    removeMutation.mutate(value.path)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (disabled || uploadMutation.isPending || removeMutation.isPending) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const hasImage  = !!value?.url
  const uploading = uploadMutation.isPending
  const removing  = removeMutation.isPending
  const busy      = uploading || removing
  const error     = uploadMutation.error
    ? (uploadMutation.error as any)?.response?.data?.error ?? "Upload failed. Please try again."
    : removeMutation.error
    ? "Remove failed. Please try again."
    : null

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full rounded-2xl border-2 overflow-hidden transition-colors",
          aspectRatio,
          hasImage
            ? "border-border"
            : "border-dashed border-border bg-surface-subtle hover:border-brand-300 hover:bg-brand-50",
          (disabled || busy) && "pointer-events-none opacity-60",
          !hasImage && "cursor-pointer"
        )}
        onClick={() => !hasImage && !busy && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {hasImage ? (
          <>
            <DImage
              src={value!.url}
              alt="Uploaded"
              fill
              skipTransform
              className="absolute inset-0"
            />
            {removing ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <p className="text-xs text-white">Removing…</p>
              </div>
            ) : (
              !disabled && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemove() }}
                  className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )
            )}
          </>
        ) : uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <p className="text-xs text-text-tertiary">Uploading…</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center">
            <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <ImagePlus className="h-5 w-5 text-brand-500" />
            </div>
            <p className="text-sm font-medium text-text-primary leading-tight">
              Click or drag to upload
            </p>
            <p className="text-xs text-text-tertiary">{hint}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-danger-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled || busy}
      />
    </div>
  )
}
