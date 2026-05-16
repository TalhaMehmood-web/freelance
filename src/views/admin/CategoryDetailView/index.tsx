"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  type ColumnDef,
} from "@tanstack/react-table"
import {
  ArrowLeft, FolderTree, Plus, MoreHorizontal,
  Pencil, Trash2, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, SortableHeader } from "@/components/ui/data-table"
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCategoryDetailQuery } from "./hooks/useCategoryDetailQuery"
import { useCategoryMutations } from "@/views/admin/CategoriesView/hooks/useCategoryMutations"
import { CategoryFormDialog } from "@/views/admin/CategoriesView/CategoryFormDialog"
import { DeleteCategoryDialog } from "@/views/admin/CategoriesView/DeleteCategoryDialog"
import type { CategoryWithChildren } from "@/views/admin/CategoriesView/hooks/useCategoriesQuery"
import type { CategoryFormData } from "@/schemas/admin/categories"
import type { Category } from "@prisma/client"

interface CategoryDetailViewProps {
  categoryId: string
}

export function CategoryDetailView({ categoryId }: CategoryDetailViewProps) {
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

  const { data, isLoading, isFetching, isError } = useCategoryDetailQuery(categoryId, {
    search,
    status: status === "all" ? "" : status,
    sortBy,
    sortDir,
    page,
    perPage: 20,
  })

  const { updateMutation, toggleMutation, deleteMutation, createMutation } = useCategoryMutations()

  const [formOpen, setFormOpen]       = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [editingCat, setEditingCat]   = useState<Category | null>(null)
  const [deletingCat, setDeletingCat] = useState<Category | null>(null)
  const [togglingId, setTogglingId]   = useState<string | null>(null)

  const category  = data?.data
  const children  = data?.data?.children ?? []
  const total     = data?.total     ?? 0
  const pageCount = data?.pageCount ?? 1

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    toggleMutation.isPending ||
    deleteMutation.isPending

  const currentSort = { id: sortBy, desc: sortDir === "desc" }

  function handleSort(column: string) {
    navigate({
      sortBy:  column,
      sortDir: sortBy === column && sortDir === "asc" ? "desc" : "asc",
    })
  }

  function handleEdit(cat: Category) {
    setEditingCat(cat)
    setFormOpen(true)
  }

  function handleEditParent() {
    if (!category) return
    setEditingCat(category)
    setFormOpen(true)
  }

  function handleDelete(cat: Category) {
    setDeletingCat(cat)
    setDeleteOpen(true)
  }

  function handleToggle(cat: Category) {
    setTogglingId(cat.id)
    toggleMutation.mutate(
      { id: cat.id, isActive: !cat.isActive, parentId: categoryId },
      { onSettled: () => setTogglingId(null) },
    )
  }

  function handleAddSubcategory() {
    setEditingCat(null)
    setFormOpen(true)
  }

  async function handleFormSubmit(formData: CategoryFormData) {
    if (editingCat) {
      await updateMutation.mutateAsync({ id: editingCat.id, data: formData, parentId: categoryId })
    } else {
      await createMutation.mutateAsync({ ...formData, parentId: categoryId })
    }
    setFormOpen(false)
    setEditingCat(null)
  }

  async function handleDeleteConfirm(id: string) {
    await deleteMutation.mutateAsync({ id, parentId: categoryId })
  }

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: () => (
        <SortableHeader label="Name" column="name" currentSort={currentSort} onSort={handleSort} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.icon && <span className="text-base leading-none">{row.original.icon}</span>}
          <span className="text-sm font-medium text-text-primary">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: () => (
        <SortableHeader label="Slug" column="slug" currentSort={currentSort} onSort={handleSort} />
      ),
      cell: ({ row }) => (
        <code className="text-xs bg-surface-subtle border border-border px-1.5 py-0.5 rounded text-text-secondary font-mono">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: () => (
        <SortableHeader label="Order" column="sortOrder" currentSort={currentSort} onSort={handleSort} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-text-secondary">{row.original.sortOrder}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={row.original.isActive
            ? "bg-green-50 text-green-700 border border-green-200 text-xs"
            : "bg-surface-subtle text-text-tertiary border border-border text-xs"}
        >
          {row.original.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },
    {
      id:   "actions",
      size: 48,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const cat        = row.original
        const isToggling = togglingId === cat.id
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger disabled={isToggling}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-text-tertiary hover:text-text-primary"
                  aria-label="Row actions"
                  disabled={isToggling}
                >
                  {isToggling
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleEdit(cat)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleToggle(cat)} disabled={isPending}>
                    {cat.isActive
                      ? <><ToggleLeft  className="w-4 h-4" /> Deactivate</>
                      : <><ToggleRight className="w-4 h-4" /> Activate</>}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => handleDelete(cat)}
                    className="text-danger-600 focus:text-danger-600 focus:bg-danger-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-text-tertiary">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading&hellip;</span>
      </div>
    )
  }

  if (isError || !category) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm text-danger-600">Failed to load category.</p>
        <Button variant="outline" render={<Link href="/admin/categories" />}>
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
      </div>
    )
  }

  // Build parent list for CategoryFormDialog (only the parent itself as option)
  const parentAsOption: CategoryWithChildren = { ...category, children: [] }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" className="h-8 w-8" render={<Link href="/admin/categories" />}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <FolderTree className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary leading-none">
              {category.icon && <span className="mr-1.5">{category.icon}</span>}
              {category.name}
            </h1>
            <p className="text-xs text-text-tertiary mt-0.5">Category details</p>
          </div>
        </div>
        <Button onClick={handleEditParent} variant="outline" className="gap-2 shrink-0">
          <Pencil className="h-4 w-4" />
          Edit Category
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">Slug</p>
            <code className="text-sm bg-surface-subtle border border-border px-2 py-0.5 rounded font-mono text-text-secondary">
              {category.slug}
            </code>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">Status</p>
            <Badge
              className={category.isActive
                ? "bg-green-50 text-green-700 border border-green-200 text-xs"
                : "bg-surface-subtle text-text-tertiary border border-border text-xs"}
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">Sort Order</p>
            <p className="text-sm font-semibold text-text-primary">{category.sortOrder}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">Subcategories</p>
            <p className="text-sm font-semibold text-text-primary">{total}</p>
          </div>
        </div>
      </div>

      {/* Subcategories section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-text-primary">Subcategories</h2>
          <Button onClick={handleAddSubcategory} className="gap-2 shrink-0" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add Subcategory
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-2xl border border-border shadow-card p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <DebouncedSearchInput
              value={search}
              onChange={v => navigate({ search: v || undefined })}
              placeholder="Search subcategories&hellip;"
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

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={children}
          isLoading={false}
          isFetching={isFetching}
          sorting={[{ id: sortBy, desc: sortDir === "desc" }]}
          onSortChange={updater => {
            const next = typeof updater === "function"
              ? updater([{ id: sortBy, desc: sortDir === "desc" }])
              : updater
            if (next[0]) {
              navigate({ sortBy: next[0].id, sortDir: next[0].desc ? "desc" : "asc" })
            }
          }}
          page={page}
          pageCount={pageCount}
          total={total}
          perPage={20}
          onPage={p => navigate({ page: String(p) })}
          emptyMessage={search ? "No subcategories match your search" : "No subcategories yet"}
        />
      </div>

      {/* Dialogs */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditingCat(null)
        }}
        editing={editingCat}
        preselectedParentId={editingCat ? undefined : categoryId}
        parents={[parentAsOption]}
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
