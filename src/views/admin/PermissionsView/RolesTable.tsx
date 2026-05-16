"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient as axios } from "@/lib/client/axios"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { type SortingState } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input"
import { RoleForm } from "./RoleForm"
import { AssignPermissionsDialog } from "./AssignPermissionsDialog"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import { buildRoleColumns } from "./roleColumns"
import type { RoleRow } from "@/types/admin"

const PER_PAGE = 10

interface RolesResponse {
  data:      RoleRow[]
  total:     number
  pageCount: number
  page:      number
  perPage:   number
}

interface Props {
  isSuperAdmin: boolean
}

export function RolesTable({ isSuperAdmin }: Props) {
  const queryClient = useQueryClient()

  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState("")
  const [sorting, setSorting]       = useState<SortingState>([{ id: "createdAt", desc: true }])
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<RoleRow | null>(null)
  const [assignTarget, setAssignTarget] = useState<RoleRow | null>(null)
  const [assignOpen, setAssignOpen]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null)

  const sortBy  = sorting[0]?.id  ?? "createdAt"
  const sortDir = sorting[0]?.desc ? "desc" : "asc"

  const { data, isLoading, isFetching } = useQuery<RolesResponse>({
    queryKey: ["admin-roles", { page, search, sortBy, sortDir }],
    queryFn:  () => axios.get("/api/admin/roles", {
      params: { page, perPage: PER_PAGE, search, sortBy, sortDir },
    }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/admin/roles/${id}`),
    onSuccess: () => {
      toast.success("Role deleted.")
      setDeleteTarget(null)
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to delete role.")
    },
  })

  function handleDelete(role: RoleRow) {
    if (role.isBuiltIn) return
    setDeleteTarget(role)
  }

  function handleEdit(role: RoleRow) {
    setEditTarget(role)
    setFormOpen(true)
  }

  function handleAssign(role: RoleRow) {
    setAssignTarget(role)
    setAssignOpen(true)
  }

  function handleSaved(_role: RoleRow) {
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
    setFormOpen(false)
    setEditTarget(null)
    toast.success(editTarget ? "Role updated." : "Role created.")
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  const currentSort = sorting[0]
    ? { id: sorting[0].id, desc: sorting[0].desc }
    : { id: "createdAt", desc: true }

  const columns = buildRoleColumns({
    currentSort,
    onSort: (col) => {
      setSorting(prev => {
        const current = prev[0]
        if (current?.id === col) return [{ id: col, desc: !current.desc }]
        return [{ id: col, desc: true }]
      })
      setPage(1)
    },
    onEdit:       handleEdit,
    onAssign:     handleAssign,
    onDelete:     handleDelete,
    isSuperAdmin,
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <DebouncedSearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search roles…"
          triggerOnEnter
          className="w-full sm:w-72 flex-none"
        />
        {isSuperAdmin && (
          <Button size="sm" onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="w-4 h-4" />
            New Role
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        page={data?.page ?? page}
        pageCount={data?.pageCount ?? 1}
        total={data?.total ?? 0}
        perPage={PER_PAGE}
        onPage={p => setPage(p)}
        emptyMessage="No roles found."
        skeletonRows={5}
      />

      <RoleForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onSaved={handleSaved}
        role={editTarget}
        isSuperAdmin={isSuperAdmin}
      />

      <AssignPermissionsDialog
        role={assignTarget}
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setAssignTarget(null) }}
        isSuperAdmin={isSuperAdmin}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Delete Role"
        description={deleteTarget ? `Delete role "${deleteTarget.label}"? This cannot be undone.` : ""}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
