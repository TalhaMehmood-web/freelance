"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { GigBasicsData } from "@/schemas/client/gigs"

const CATEGORIES = [
  { id: "cat_dev",     name: "Development & IT" },
  { id: "cat_design",  name: "Design & Creative" },
  { id: "cat_video",   name: "Video & Animation" },
  { id: "cat_writing", name: "Writing & Translation" },
  { id: "cat_mktg",    name: "Digital Marketing" },
  { id: "cat_data",    name: "Data & Analytics" },
  { id: "cat_music",   name: "Music & Audio" },
  { id: "cat_biz",     name: "Business" },
  { id: "cat_ai",      name: "AI Services" },
]

export function Step1Overview() {
  const form = useFormContext<GigBasicsData>()
  const { register, formState: { errors }, watch, setValue } = form
  const [tagInput, setTagInput] = useState("")
  const tags = watch("searchTags") ?? []

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (!tag || tags.includes(tag) || tags.length >= 5) return
    setValue("searchTags", [...tags, tag], { shouldValidate: true })
    setTagInput("")
  }

  function removeTag(tag: string) {
    setValue("searchTags", tags.filter((t) => t !== tag), { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Gig Overview</h2>
        <p className="text-sm text-text-secondary">
          Give your gig a clear, descriptive title and choose the right category so buyers can find it.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="gig-title">
          Gig Title <span className="text-danger-500">*</span>
        </Label>
        <Input
          id="gig-title"
          placeholder="e.g. I will build a responsive React + Next.js web application"
          maxLength={80}
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        <div className="flex items-center justify-between">
          {errors.title ? (
            <p className="text-xs text-danger-600">{errors.title.message}</p>
          ) : (
            <p className="text-xs text-text-tertiary">Min 15 characters. Start with &ldquo;I will&rdquo; for best results.</p>
          )}
          <span className="text-xs text-text-tertiary ml-auto shrink-0">
            {(watch("title") ?? "").length}/80
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>
          Category <span className="text-danger-500">*</span>
        </Label>
        <Select
          value={watch("categoryId") ?? ""}
          onValueChange={(v) => v && setValue("categoryId", v, { shouldValidate: true })}
        >
          <SelectTrigger aria-invalid={!!errors.categoryId}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-danger-600">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Search Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="gig-tag-input">
          Search Tags <span className="text-danger-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="gig-tag-input"
            placeholder="e.g. react, nextjs, typescript"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
            disabled={tags.length >= 5}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={tags.length >= 5 || !tagInput.trim()}
          >
            Add
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full"
              >
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeTag(tag)}
                  className="h-auto w-auto p-0 hover:bg-transparent text-brand-500 hover:text-brand-700"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {errors.searchTags && (
            <p className="text-xs text-danger-600">
              {typeof errors.searchTags === "object" && "message" in errors.searchTags
                ? (errors.searchTags as { message?: string }).message
                : "Add at least one tag"}
            </p>
          )}
          <p className="text-xs text-text-tertiary ml-auto">{tags.length}/5 tags</p>
        </div>
      </div>
    </div>
  )
}
