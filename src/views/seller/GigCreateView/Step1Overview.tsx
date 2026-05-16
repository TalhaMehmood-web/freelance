"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { X, Lightbulb, Hash, Layers, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { GigBasicsData } from "@/schemas/client/gigs"
import { useGigWizard } from "./GigWizardContext"

export function Step1Overview() {
  const { categories } = useGigWizard()
  const { register, formState: { errors }, watch, setValue } = useFormContext<GigBasicsData>()
  const [tagInput, setTagInput] = useState("")

  const tags       = watch("searchTags") ?? []
  const categoryId = watch("categoryId")
  const title      = watch("title") ?? ""

  const selectedCategory = categories.find(c => c.id === categoryId)
  const subcategories    = selectedCategory?.children ?? []

  function handleCategoryChange(id: string) {
    setValue("categoryId", id, { shouldValidate: true })
    setValue("subcategoryId", undefined, { shouldValidate: false })
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
    if (!tag || tags.includes(tag) || tags.length >= 5) return
    setValue("searchTags", [...tags, tag], { shouldValidate: true })
    setTagInput("")
  }

  function removeTag(tag: string) {
    setValue("searchTags", tags.filter(t => t !== tag), { shouldValidate: true })
  }

  const titleLen   = title.length
  const titlePct   = Math.min(titleLen / 80, 1)
  const titleColor = titleLen < 15 ? "bg-danger-400" : titleLen < 50 ? "bg-brand-500" : "bg-green-500"

  return (
    <div className="space-y-8">

      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="gig-title" className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            Gig Title <span className="text-danger-500">*</span>
          </Label>
          <span className={`text-xs font-medium tabular-nums ${titleLen < 15 ? "text-danger-500" : "text-text-tertiary"}`}>
            {titleLen}/80
          </span>
        </div>

        <div className="relative">
          <Input
            id="gig-title"
            placeholder='e.g. "I will build a stunning React + Next.js website"'
            maxLength={80}
            aria-invalid={!!errors.title}
            className="pr-4 h-11 text-sm"
            {...register("title")}
          />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-sm bg-border overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${titleColor}`}
              style={{ width: `${titlePct * 100}%` }}
            />
          </div>
        </div>

        {errors.title ? (
          <p className="text-xs text-danger-600">{errors.title.message}</p>
        ) : (
          <div className="flex items-start gap-1.5 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            <Lightbulb className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
            <p className="text-xs text-brand-700 leading-relaxed">
              Start with <strong>&ldquo;I will&rdquo;</strong> and be specific — e.g.{" "}
              <em>&ldquo;I will build a responsive Shopify store with custom theme&rdquo;</em>
            </p>
          </div>
        )}
      </div>

      {/* Category + Subcategory */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Layers className="w-4 h-4 text-text-tertiary" />
          <Label className="text-sm font-semibold text-text-primary">
            Category <span className="text-danger-500">*</span>
          </Label>
        </div>

        <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <Select value={categoryId ?? ""} onValueChange={v => v && handleCategoryChange(v)}>
              <SelectTrigger aria-invalid={!!errors.categoryId} className="h-11">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-danger-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="relative space-y-1.5">
            <Select
              value={watch("subcategoryId") ?? ""}
              onValueChange={v => setValue("subcategoryId", v === "__none__" ? undefined : v || undefined, { shouldValidate: false })}
              disabled={subcategories.length === 0}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={
                  !categoryId            ? "Select a category first"
                  : subcategories.length === 0 ? "No subcategories"
                  : "Select a subcategory"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {subcategories.map(sub => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subcategories.length > 0 && (
              <span className="absolute -top-2 right-2 text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-medium pointer-events-none">
                optional
              </span>
            )}
          </div>
        </div>

        {categoryId && subcategories.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-text-tertiary pt-0.5">
            <ChevronRight className="w-3 h-3" />
            <span>{selectedCategory?.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brand-600 font-medium">
              {subcategories.find(s => s.id === watch("subcategoryId"))?.name ?? "choose subcategory"}
            </span>
          </div>
        )}
      </div>

      {/* Search Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-text-tertiary" />
            Search Tags <span className="text-danger-500">*</span>
          </Label>
          <span className={`text-xs font-medium ${tags.length >= 5 ? "text-green-600" : "text-text-tertiary"}`}>
            {tags.length}/5
          </span>
        </div>

        <div className="flex gap-2">
          <Input
            id="gig-tag-input"
            placeholder='Add a keyword, press Enter or click Add'
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
            disabled={tags.length >= 5}
            className="flex-1 h-11"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={tags.length >= 5 || !tagInput.trim()}
            className="h-11 px-4 shrink-0"
          >
            Add
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-brand-400 hover:text-brand-700 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {errors.searchTags && (
          <p className="text-xs text-danger-600">
            {typeof errors.searchTags === "object" && "message" in errors.searchTags
              ? (errors.searchTags as { message?: string }).message
              : "Add at least one tag"}
          </p>
        )}

        {tags.length === 0 && !errors.searchTags && (
          <p className="text-xs text-text-tertiary">
            Up to 5 keywords buyers search for — e.g. <em>react, nextjs, typescript</em>
          </p>
        )}
      </div>
    </div>
  )
}
