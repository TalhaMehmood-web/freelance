"use client"

import { useFormContext, useFieldArray, Controller } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import type { GigDescriptionData } from "@/schemas/client/gigs"

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim()
}

export function Step3Description() {
  const { watch, formState: { errors }, control } = useFormContext<GigDescriptionData>()
  const { fields, append, remove } = useFieldArray({ control, name: "faqs" })
  const rawHtml   = watch("description") ?? ""
  const charCount = stripHtml(rawHtml).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Description & FAQ</h2>
        <p className="text-sm text-text-secondary">
          Write a compelling description. Add FAQs to answer common buyer questions.
        </p>
      </div>

      {/* Rich text description */}
      <div className="space-y-1.5">
        <Label>
          Description <span className="text-danger-500">*</span>
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Describe your service in detail — what you offer, your process, what buyers get, and why you're the right choice…"
              minHeight={240}
              maxLength={12_000}
              className={errors.description ? "border-destructive ring-3 ring-destructive/20" : ""}
            />
          )}
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-danger-600">{errors.description.message}</p>
          ) : charCount < 120 ? (
            <p className="text-xs text-warning-500">{120 - charCount} more characters needed</p>
          ) : (
            <p className="text-xs text-green-600">✓ Description looks good</p>
          )}
        </div>
      </div>

      <Separator />

      {/* FAQ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Frequently Asked Questions</h3>
            <p className="text-xs text-text-tertiary mt-0.5">Optional — up to 10 FAQs</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ question: "", answer: "" })}
            disabled={fields.length >= 10}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add FAQ
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="flex items-center justify-center py-8 border-2 border-dashed border-border rounded-xl text-text-tertiary text-sm">
            No FAQs yet — click &ldquo;Add FAQ&rdquo; to add one
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field, i) => (
            <div key={field.id} className="bg-surface-subtle rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">FAQ {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(i)}
                  className="text-text-tertiary hover:text-danger-500"
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`faq-q-${i}`} className="text-xs">Question</Label>
                <Controller
                  control={control}
                  name={`faqs.${i}.question`}
                  render={({ field }) => (
                    <Input
                      id={`faq-q-${i}`}
                      placeholder="e.g. What information do you need to get started?"
                      aria-invalid={!!errors.faqs?.[i]?.question}
                      {...field}
                    />
                  )}
                />
                {errors.faqs?.[i]?.question && (
                  <p className="text-xs text-danger-600">{errors.faqs[i]?.question?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`faq-a-${i}`} className="text-xs">Answer</Label>
                <Controller
                  control={control}
                  name={`faqs.${i}.answer`}
                  render={({ field }) => (
                    <Textarea
                      id={`faq-a-${i}`}
                      rows={3}
                      placeholder="Your answer…"
                      aria-invalid={!!errors.faqs?.[i]?.answer}
                      className="resize-none"
                      {...field}
                    />
                  )}
                />
                {errors.faqs?.[i]?.answer && (
                  <p className="text-xs text-danger-600">{errors.faqs[i]?.answer?.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
