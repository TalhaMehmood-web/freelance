"use client"

import { useState } from "react"
import { ExternalLink, Trash2, Plus, Briefcase } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { AddPortfolioModal } from "./AddPortfolioModal"
import { apiClient } from "@/lib/client/axios"
import { formatDate } from "@/lib/shared/utils"
import type { PortfolioItem } from "@/types/portfolio"

interface PortfolioViewProps {
  initialItems: PortfolioItem[]
}

export function SellerPortfolioView({ initialItems }: PortfolioViewProps) {
  const queryClient = useQueryClient()
  const [items, setItems]               = useState(initialItems)
  const [addOpen, setAddOpen]           = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/seller/portfolio/${id}`),
    onSuccess: () => {
      if (deleteTarget) {
        setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ["seller-portfolio"] })
    },
  })

  function handleAdded(item: PortfolioItem) {
    setItems(prev => [item, ...prev])
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Portfolio</h1>
          <p className="text-sm text-text-secondary mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Item
        </Button>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-brand-500" />
          </div>
          <p className="text-lg font-semibold text-text-primary">No portfolio items yet</p>
          <p className="text-sm text-text-secondary mt-1 mb-4">Showcase your best work to attract buyers</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden group">
              {/* Cover */}
              <div className="h-36 bg-linear-to-br from-brand-50 via-brand-100 to-blue-50 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-brand-300" />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-xs text-text-tertiary mt-2">{formatDate(item.createdAt)}</p>

                <div className="flex items-center gap-2 mt-3">
                  {item.externalUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      render={<a href={item.externalUrl} target="_blank" rel="noopener noreferrer" />}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      View
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-danger-600 hover:bg-danger-50 hover:border-danger-200"
                    onClick={() => setDeleteTarget(item)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPortfolioModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={handleAdded}
      />

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={v => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Portfolio Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-text-primary">"{deleteTarget?.title}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
