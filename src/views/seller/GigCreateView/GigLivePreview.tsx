"use client"

import { useFormContext, useWatch, type UseFormReturn } from "react-hook-form"
import { Eye, Tag, Package, AlignLeft, CheckCircle2, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/shared/utils"
import type { GigBasicsData, GigPricingData, GigDescriptionData } from "@/schemas/client/gigs"

const CATEGORIES: Record<string, string> = {
  cat_dev:     "Development & IT",
  cat_design:  "Design & Creative",
  cat_video:   "Video & Animation",
  cat_writing: "Writing & Translation",
  cat_mktg:    "Digital Marketing",
  cat_data:    "Data & Analytics",
  cat_music:   "Music & Audio",
  cat_biz:     "Business",
  cat_ai:      "AI Services",
}

interface GigLivePreviewProps {
  currentStep:     number
  basicsForm:      UseFormReturn<GigBasicsData>
  pricingForm:     UseFormReturn<GigPricingData>
  descriptionForm: UseFormReturn<GigDescriptionData>
}

function BasicsPreview({ form }: { form: UseFormReturn<GigBasicsData> }) {
  const title      = useWatch({ control: form.control, name: "title" })
  const categoryId = useWatch({ control: form.control, name: "categoryId" })
  const tags       = useWatch({ control: form.control, name: "searchTags" }) ?? []

  return (
    <>
      <div className="aspect-[16/9] w-full rounded-xl bg-linear-to-br from-brand-50 via-brand-100 to-blue-50 flex items-center justify-center mb-4">
        <div className="text-center px-4">
          <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center mx-auto mb-2">
            <Eye className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-xs text-brand-400">Cover image</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
          {title || <span className="text-text-tertiary italic">Your gig title will appear here…</span>}
        </p>
        {categoryId && (
          <span className="inline-flex items-center gap-1 text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-full">
            <Tag className="w-3 h-3" />
            {CATEGORIES[categoryId] ?? categoryId}
          </span>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.map(tag => (
              <span key={tag} className="text-xs bg-surface-subtle border border-border text-text-secondary px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function PricingPreview({ form }: { form: UseFormReturn<GigPricingData> }) {
  const basic    = useWatch({ control: form.control, name: "basic" })
  const standard = useWatch({ control: form.control, name: "standard" })
  const premium  = useWatch({ control: form.control, name: "premium" })

  const packages = [
    { key: "basic",    data: basic,    color: "text-text-secondary", bg: "bg-surface-subtle" },
    { key: "standard", data: standard, color: "text-brand-600",      bg: "bg-brand-50" },
    { key: "premium",  data: premium,  color: "text-accent-600",     bg: "bg-accent-50" },
  ].filter(p => p.data?.enabled)

  if (packages.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-center">
        <div>
          <Package className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
          <p className="text-xs text-text-tertiary">Enable a package to preview pricing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {packages.map(({ key, data, color, bg }) => (
        <div key={key} className={`rounded-xl border border-border p-3 ${bg}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold capitalize ${color}`}>{key}</span>
            {data.priceCents > 0 && (
              <span className="text-sm font-bold text-text-primary">{formatCurrency(data.priceCents)}</span>
            )}
          </div>
          {data.name && <p className="text-xs text-text-primary font-medium truncate">{data.name}</p>}
          {data.description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{data.description}</p>}
          {(data.deliveryDays > 0 || data.revisions >= 0) && (
            <div className="flex items-center gap-3 mt-1.5">
              {data.deliveryDays > 0 && (
                <span className="flex items-center gap-1 text-xs text-text-tertiary">
                  <Clock className="w-3 h-3" />{data.deliveryDays}d delivery
                </span>
              )}
              <span className="text-xs text-text-tertiary">
                {data.revisions === 99 ? "Unlimited" : data.revisions} revision{data.revisions !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DescriptionPreview({ form }: { form: UseFormReturn<GigDescriptionData> }) {
  const description = useWatch({ control: form.control, name: "description" }) ?? ""
  const faqs        = useWatch({ control: form.control, name: "faqs" }) ?? []

  return (
    <div className="space-y-3">
      {description && description !== "<p></p>" ? (
        <div
          className="text-xs text-text-secondary leading-relaxed line-clamp-6 [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:font-semibold [&_h3]:text-text-primary [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-300 [&_blockquote]:pl-2 [&_blockquote]:italic [&_strong]:font-semibold [&_em]:italic [&_s]:line-through"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <AlignLeft className="w-7 h-7 text-text-tertiary mx-auto mb-2" />
            <p className="text-xs text-text-tertiary">Your description preview</p>
          </div>
        </div>
      )}
      {faqs.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">FAQ ({faqs.length})</p>
          {faqs.slice(0, 2).map((faq, i) => (
            <div key={i} className="text-xs">
              <p className="font-medium text-text-primary truncate">{faq.question || "Question…"}</p>
              <p className="text-text-tertiary truncate mt-0.5">{faq.answer || "Answer…"}</p>
            </div>
          ))}
          {faqs.length > 2 && <p className="text-xs text-text-tertiary">+{faqs.length - 2} more</p>}
        </div>
      )}
    </div>
  )
}

function CompletionChecklist({
  basicsForm, pricingForm, descriptionForm,
}: {
  basicsForm: UseFormReturn<GigBasicsData>
  pricingForm: UseFormReturn<GigPricingData>
  descriptionForm: UseFormReturn<GigDescriptionData>
}) {
  const title      = useWatch({ control: basicsForm.control, name: "title" }) ?? ""
  const categoryId = useWatch({ control: basicsForm.control, name: "categoryId" }) ?? ""
  const tags       = useWatch({ control: basicsForm.control, name: "searchTags" }) ?? []
  const basic      = useWatch({ control: pricingForm.control, name: "basic" })
  const standard   = useWatch({ control: pricingForm.control, name: "standard" })
  const premium    = useWatch({ control: pricingForm.control, name: "premium" })
  const description = useWatch({ control: descriptionForm.control, name: "description" }) ?? ""

  const checks = [
    { label: "Gig title",   done: title.length >= 15 },
    { label: "Category",    done: !!categoryId },
    { label: "Search tags", done: tags.length >= 1 },
    { label: "A package",   done: basic?.enabled || standard?.enabled || premium?.enabled },
    { label: "Description", done: description.length >= 120 },
  ]

  const doneCount = checks.filter(c => c.done).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Completion</p>
        <span className="text-xs font-bold text-brand-600">{doneCount}/{checks.length}</span>
      </div>
      <div className="w-full bg-border rounded-full h-1.5 mb-3">
        <div
          className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(doneCount / checks.length) * 100}%` }}
        />
      </div>
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-2">
          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${c.done ? "text-green-500" : "text-border"}`} />
          <span className={`text-xs ${c.done ? "text-text-primary" : "text-text-tertiary"}`}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export function GigLivePreview({
  currentStep, basicsForm, pricingForm, descriptionForm,
}: GigLivePreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Card preview */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-subtle">
          <Eye className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-xs font-medium text-text-secondary">Live Preview</span>
        </div>
        <div className="p-4">
          {currentStep === 1 && <BasicsPreview form={basicsForm} />}
          {currentStep === 2 && <PricingPreview form={pricingForm} />}
          {currentStep === 3 && <DescriptionPreview form={descriptionForm} />}
          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand-400" />
              </div>
              <p className="text-xs text-text-tertiary">Gallery preview available after upload</p>
            </div>
          )}
          {currentStep === 5 && <BasicsPreview form={basicsForm} />}
        </div>
      </div>

      {/* Completion checklist */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-4">
        <CompletionChecklist
          basicsForm={basicsForm}
          pricingForm={pricingForm}
          descriptionForm={descriptionForm}
        />
      </div>
    </div>
  )
}
