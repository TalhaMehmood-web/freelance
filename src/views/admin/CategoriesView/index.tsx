"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  type ExpandedState,
} from "@tanstack/react-table"
import { Plus, FolderTree, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table"
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input"
import { useCategoriesQuery } from "./hooks/useCategoriesQuery"
import { useCategoryMutations } from "./hooks/useCategoryMutations"
import { buildCategoryColumns } from "./columns"
import { CategoryFormDialog } from "./CategoryFormDialog"
import { DeleteCategoryDialog } from "./DeleteCategoryDialog"
import type { CategoryFormData } from "@/schemas/admin/categories"
import type { Category } from "@prisma/client"

export function CategoriesView() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const search  = searchParams.get("search")  ?? ""
  const status  = searchParams.get("status")  ?? "all"
  const sortBy  = searchParams.get("sortBy")  ?? "sortOrder"
  const sortDir = searchParams.get("sortDir") ?? "asc"
  const page    = Math.max(1, Number(searchParams.get("page")) || 1)

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === "") params.delete(k)
      else params.set(k, v)
    })
    if (!("page" in updates)) params.delete("page")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const { data, isLoading, isFetching, isError } = useCategoriesQuery({
    search,
    status: status === "all" ? "" : status,
    sortBy,
    sortDir,
    page,
    perPage: 20,
  })

  const { createMutation, updateMutation, toggleMutation, deleteMutation } = useCategoryMutations()

  const [expanded, setExpanded]                   = useState<ExpandedState>({})
  const [formOpen, setFormOpen]                   = useState(false)
  const [deleteOpen, setDeleteOpen]               = useState(false)
  const [editingCat, setEditingCat]               = useState<Category | null>(null)
  const [deletingCat, setDeletingCat]             = useState<Category | null>(null)
  const [preselectedParentId, setPreselectedParentId] = useState<string | undefined>(undefined)
  const [togglingId, setTogglingId]               = useState<string | null>(null)

  const allCategories = data?.data ?? []
  const total     = data?.total     ?? 0
  const pageCount = data?.pageCount ?? 1

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    toggleMutation.isPending ||
    deleteMutation.isPending

  const currentSort = { id: sortBy, desc: sortDir === "desc" }

  function handleSort(column: string) {
    const isActive = sortBy === column
    navigate({
      sortBy:  column,
      sortDir: isActive && sortDir === "asc" ? "desc" : "asc",
    })
  }

  function handleEdit(cat: Category) {
    setEditingCat(cat)
    setPreselectedParentId(undefined)
    setFormOpen(true)
  }

  function handleDelete(cat: Category) {
    setDeletingCat(cat)
    setDeleteOpen(true)
  }

  function handleToggle(cat: Category) {
    setTogglingId(cat.id)
    toggleMutation.mutate(
      { id: cat.id, isActive: !cat.isActive, parentId: cat.parentId ?? undefined },
      { onSettled: () => setTogglingId(null) },
    )
  }

  function handleAddSubcategory(parent: Category) {
    setEditingCat(null)
    setPreselectedParentId(parent.id)
    setFormOpen(true)
  }

  function handleAddCategory() {
    setEditingCat(null)
    setPreselectedParentId(undefined)
    setFormOpen(true)
  }

  async function handleFormSubmit(formData: CategoryFormData) {
    if (editingCat) {
      await updateMutation.mutateAsync({ id: editingCat.id, data: formData, parentId: formData.parentId })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setFormOpen(false)
  }

  async function handleDeleteConfirm(id: string) {
    const cat = allCategories.find(c => c.id === id) ??
      allCategories.flatMap(c => c.children).find(c => c.id === id)
    await deleteMutation.mutateAsync({ id, parentId: cat?.parentId ?? undefined })
  }

  const columns = buildCategoryColumns({
    onEdit:           handleEdit,
    onDelete:         handleDelete,
    onToggle:         handleToggle,
    onAddSubcategory: handleAddSubcategory,
    isPending,
    togglingId,
    currentSort,
    onSort:           handleSort,
  })

  const table = useReactTable({
    data:                allCategories,
    columns,
    state:               { expanded },
    onExpandedChange:    setExpanded,
    getSubRows:          row => row.children as typeof allCategories,
    getCoreRowModel:     getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualSorting:       true,
    manualPagination:    true,
  })

  const subCatCount = allCategories.reduce((acc, c) => acc + c.children.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <FolderTree className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary leading-none">Categories</h1>
            <p className="text-xs text-text-tertiary mt-0.5">
              {total} categories &middot; {subCatCount} subcategories shown
            </p>
          </div>
        </div>
        <Button onClick={handleAddCategory} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <DebouncedSearchInput
            value={search}
            onChange={v => navigate({ search: v || undefined })}
            placeholder="Search categories&hellip;"
            className="flex-1 min-w-48 max-w-xs"
          />
          <Tabs value={status} onValueChange={v => navigate({ status: v === "all" ? undefined : v })}>
            <TabsList className="h-9">
              <TabsTrigger value="all"      className="text-xs px-3">All</TabsTrigger>
              <TabsTrigger value="active"   className="text-xs px-3">Active</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs px-3">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className={`bg-surface rounded-2xl border border-border shadow-card overflow-hidden transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-text-tertiary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading categories&hellip;</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16 text-sm text-danger-600">
              Failed to load categories. Please refresh.
            </div>
          ) : allCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary mb-0.5">
                  {search ? "No categories match your search" : "No categories yet"}
                </p>
                <p className="text-xs text-text-tertiary">
                  {search
                    ? "Try a different search term"
                    : "Click “Add Category” to create your first one"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(hg => (
                    <TableRow key={hg.id} className="border-b border-border bg-surface-subtle">
                      {hg.headers.map(header => (
                        <TableHead
                          key={header.id}
                          style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                          className="text-xs font-semibold text-text-secondary uppercase tracking-wide py-3 px-4"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      className={`border-b border-border last:border-0 hover:bg-surface-subtle/50 transition-colors ${
                        row.depth > 0 ? "bg-surface-subtle/30" : ""
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="py-3 px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !isError && total > 0 && (
          <DataTablePagination
            page={page}
            pageCount={pageCount}
            total={total}
            perPage={20}
            onPage={p => navigate({ page: String(p) })}
          />
        )}
      </div>

      {/* Dialogs */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) { setEditingCat(null); setPreselectedParentId(undefined) }
        }}
        editing={editingCat}
        preselectedParentId={preselectedParentId}
        parents={allCategories}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deletingCat}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
