"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient as axios } from "@/lib/client/axios"
import { toast } from "sonner"
import { Plus, Trash2, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import type { PermissionResourceRow } from "@/types/admin"

interface Props {
  isSuperAdmin: boolean
}

interface ResourcesResponse {
  data: PermissionResourceRow[]
}

export function ResourcesTable({ isSuperAdmin }: Props) {
  const queryClient = useQueryClient()
  const [adding, setAdding]             = useState(false)
  const [label, setLabel]               = useState("")
  const [slug, setSlug]                 = useState("")
  const [deleteTarget, setDeleteTarget] = useState<PermissionResourceRow | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)

  const { data, isLoading } = useQuery<ResourcesResponse>({
    queryKey: ["admin-resources"],
    queryFn:  () => axios.get("/api/admin/resources").then(r => r.data),
  })

  const rows: PermissionResourceRow[] = data?.data ?? []

  const createMutation = useMutation({
    mutationFn: (body: { slug: string; label: string }) =>
      axios.post("/api/admin/resources", body),
    onSuccess: () => {
      toast.success("Resource created.")
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] })
      setAdding(false)
      setLabel("")
      setSlug("")
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to create resource.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/admin/resources/${id}`),
    onSuccess: () => {
      toast.success("Resource deleted.")
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to delete resource.")
    },
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => axios.delete("/api/admin/resources"),
    onSuccess: (res) => {
      toast.success(`All ${res.data.deleted} resources deleted.`)
      setDeleteAllOpen(false)
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to delete all resources.")
    },
  })

  function handleLabelChange(val: string) {
    setLabel(val)
    setSlug(val.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""))
  }

  function handleSubmit() {
    if (!slug || !label) return
    createMutation.mutate({ slug, label })
  }

  function handleDelete(row: PermissionResourceRow) {
    setDeleteTarget(row)
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card flex flex-col gap-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-text-primary">Resources</h3>
          <Badge variant="secondary" className="text-xs">{rows.length}</Badge>
        </div>
        {isSuperAdmin && !adding && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="destructive" onClick={() => setDeleteAllOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete All
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add Resource
            </Button>
          </div>
        )}
      </div>

      {adding && (
        <div className="flex items-end gap-2 px-5 py-3 border-b border-border bg-surface-subtle">
          <div className="flex-1 space-y-1">
            <p className="text-xs text-text-tertiary font-medium">Label</p>
            <Input
              autoFocus
              placeholder="e.g. Invoices"
              value={label}
              onChange={e => handleLabelChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSubmit()
                if (e.key === "Escape") { setAdding(false); setLabel(""); setSlug("") }
              }}
              className="h-8 text-sm"
            />
            {slug && <p className="text-[11px] text-text-tertiary font-mono">slug: {slug}</p>}
          </div>
          <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending || !slug}>
            {createMutation.isPending ? "Saving…" : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setLabel(""); setSlug("") }}>
            Cancel
          </Button>
        </div>
      )}

      <div className="divide-y divide-border">
        {isLoading && (
          <div className="px-5 py-8 text-center text-sm text-text-tertiary">Loading…</div>
        )}
        {!isLoading && rows.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-text-tertiary">No resources yet.</div>
        )}
        {rows.map(row => (
          <div key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <code className="text-xs font-mono bg-surface-subtle border border-border rounded-md px-2 py-0.5 text-text-secondary">
                {row.slug}
              </code>
              <span className="text-sm text-text-primary truncate">{row.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isSuperAdmin && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-text-tertiary hover:text-danger-600"
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Resource"
        description={deleteTarget ? `Delete resource "${deleteTarget.slug}"? Existing permissions using it will not be affected.` : ""}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <DeleteConfirmDialog
        open={deleteAllOpen}
        title="Delete All Resources"
        description="This will permanently delete every resource. Existing permissions using them will not be affected."
        isPending={deleteAllMutation.isPending}
        onConfirm={() => deleteAllMutation.mutate()}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </div>
  )
}
