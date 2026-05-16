"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Pause, Play, Trash2, ExternalLink, Copy, Eye } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/client/axios"
import type { SellerGigRow } from "@/types/gigs"

interface GigActionsCellProps {
  gig:       SellerGigRow
  onMutate?: () => void
}

export function GigActionsCell({ gig, onMutate }: GigActionsCellProps) {
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const toggleMutation = useMutation({
    mutationFn: (status: "active" | "paused") =>
      apiClient.patch(`/api/seller/gigs/${gig.id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-gigs"] })
      onMutate?.()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/seller/gigs/${gig.id}`),
    onSuccess: () => {
      setDeleteOpen(false)
      queryClient.invalidateQueries({ queryKey: ["seller-gigs"] })
      onMutate?.()
    },
  })

  const isPending = toggleMutation.isPending || deleteMutation.isPending

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {/* Edit shortcut */}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Edit gig"
          render={<Link href={`/seller/gigs/${gig.id}/edit`} />}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button size="icon-sm" variant="ghost" aria-label="More actions">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={`/seller/gigs/${gig.id}/edit`} />}>
                <Pencil className="w-4 h-4" />
                Edit Gig
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/gigs/${gig.slug}`} />}>
                <Eye className="w-4 h-4" />
                View Overview
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/gigs/${gig.slug}`} target="_blank" />}>
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(`/gigs/${gig.slug}`)}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => toggleMutation.mutate(gig.status === "active" ? "paused" : "active")}
                disabled={isPending || gig.status === "draft"}
              >
                {gig.status === "active"
                  ? <><Pause className="w-4 h-4" /> Pause Gig</>
                  : <><Play  className="w-4 h-4" /> Resume Gig</>
                }
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-danger-600 focus:text-danger-600 focus:bg-danger-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Gig
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Gig</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-text-primary">"{gig.title}"</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteMutation.mutate()} disabled={isPending}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
