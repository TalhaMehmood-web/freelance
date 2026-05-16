"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import type { Category } from "@prisma/client"

interface DeleteCategoryDialogProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  category:     Category | null
  onConfirm:    (id: string) => Promise<void>
  isPending:    boolean
}

export function DeleteCategoryDialog({
  open, onOpenChange, category, onConfirm, isPending,
}: DeleteCategoryDialogProps) {
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!category) return
    setError(null)
    try {
      await onConfirm(category.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!isPending) { setError(null); onOpenChange(v) } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-danger-50 border border-danger-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-danger-600" />
            </div>
            <DialogTitle>Delete Category</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-text-secondary">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-text-primary">{category?.name}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-xl bg-danger-50 border border-danger-100 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => { setError(null); onOpenChange(false) }}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-danger-600 hover:bg-danger-700 text-white min-w-24"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
