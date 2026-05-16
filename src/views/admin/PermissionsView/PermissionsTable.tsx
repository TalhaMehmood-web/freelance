"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { type SortingState } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input"
import { buildPermissionColumns } from "./permissionColumns"
import { PermissionForm } from "./PermissionForm"
import { ResourceCombobox } from "./ResourceCombobox"
import type { PermissionRow } from "@/types/admin"

const PER_PAGE = 15

interface PermissionsResponse {
  data:      PermissionRow[]
  total:     number
  pageCount: number
  page:      number
  perPage:   number
}


interface Props {
  isSuperAdmin: boolean
}

export function PermissionsTable({ isSuperAdmin }: Props) {
  const queryClient = useQueryClient()

  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState("")
  const [resource, setResource] = useState("all")
  const [sorting, setSorting]   = useState<SortingState>([{ id: "resource", desc: false }])
  const [formOpen, setFormOpen] = useState(false)

  const sortBy  = sorting[0]?.id  ?? "resource"
  const sortDir = sorting[0]?.desc ? "desc" : "asc"

  const { data, isLoading, isFetching } = useQuery<PermissionsResponse>({
    queryKey: ["admin-permissions", { page, search, resource, sortBy, sortDir }],
    queryFn:  () => axios.get("/api/admin/permissions", {
      params: {
        page,
        perPage:  PER_PAGE,
        search,
        resource: resource === "all" ? "" : resource,
        sortBy,
        sortDir,
      },
    }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`/api/admin/permissions?id=${encodeURIComponent(id)}`),
    onSuccess: () => {
      toast.success("Permission deleted.")
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] })
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Failed to delete permission.")
    },
  })

  function handleDelete(perm: PermissionRow) {
    if (perm.isBuiltIn) return
    if (!confirm(`Delete permission "${perm.label}"? It will be removed from all roles.`)) return
    deleteMutation.mutate(perm.id)
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  const currentSort = sorting[0]
    ? { id: sorting[0].id, desc: sorting[0].desc }
    : { id: "resource", desc: false }

  const columns = buildPermissionColumns({
    currentSort,
    onSort: (col) => {
      setSorting(prev => {
        const current = prev[0]
        if (current?.id === col) return [{ id: col, desc: !current.desc }]
        return [{ id: col, desc: false }]
      })
      setPage(1)
    },
    onDelete:     handleDelete,
    isSuperAdmin,
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
          <DebouncedSearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search permissions…"
            triggerOnEnter
            className="w-full sm:w-64 flex-none"
          />

          <ResourceCombobox
            value={resource}
            onChange={v => { setResource(v); setPage(1) }}
            className="w-52"
          />
        </div>

        {isSuperAdmin && (
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Permission
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
        emptyMessage="No permissions found."
        skeletonRows={8}
      />

      <PermissionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </>
  )
}
