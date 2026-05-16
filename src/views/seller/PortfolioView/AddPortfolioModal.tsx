"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/client/axios"
import type { PortfolioItem, AddPortfolioInput } from "@/types/portfolio"

const Schema = z.object({
  title:       z.string().min(3, "Title must be at least 3 characters").max(80, "Max 80 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  externalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})
type FormData = z.infer<typeof Schema>

interface AddPortfolioModalProps {
  open:     boolean
  onClose:  () => void
  onAdded:  (item: PortfolioItem) => void
}

export function AddPortfolioModal({ open, onClose, onAdded }: AddPortfolioModalProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { title: "", description: "", externalUrl: "" },
  })

  const addMutation = useMutation({
    mutationFn: (payload: AddPortfolioInput) =>
      apiClient.post<{ success: boolean; data: PortfolioItem }>("/api/seller/portfolio", payload),
    onSuccess: (res) => {
      onAdded(res.data.data)
      form.reset()
      onClose()
    },
    onError: () => {
      setServerError("Something went wrong.")
    },
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    addMutation.mutate({
      title:       data.title,
      description: data.description || undefined,
      externalUrl: data.externalUrl || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-500" />
            Add Portfolio Item
          </DialogTitle>
          <DialogDescription>
            Showcase your best work to attract buyers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-danger-500">*</span></Label>
            <Input id="title" placeholder="FreelanceHub Marketplace" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-danger-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project, technologies used, and your role…"
              rows={3}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-danger-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="externalUrl">External URL</Label>
            <Input id="externalUrl" placeholder="https://github.com/yourusername/project" {...form.register("externalUrl")} />
            {form.formState.errors.externalUrl && (
              <p className="text-xs text-danger-600">{form.formState.errors.externalUrl.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={addMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Adding…" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
