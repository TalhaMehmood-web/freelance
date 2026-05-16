"use client"

import Link from "next/link"
import { type ColumnDef, type Row } from "@tanstack/react-table"
import {
  ChevronRight, ChevronDown, MoreHorizontal,
  Pencil, Trash2, Eye, ToggleLeft, ToggleRight, FolderPlus, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SortableHeader } from "@/components/ui/data-table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CategoryWithChildren } from "./hooks/useCategoriesQuery"
import type { Category } from "@prisma/client"

export interface ColumnMeta {
  onEdit:           (cat: Category) => void
  onDelete:         (cat: Category) => void
  onToggle:         (cat: Category) => void
  onAddSubcategory: (cat: Category) => void
  isPending:        boolean
  togglingId:       string | null
  currentSort:      { id: string; desc: boolean } | null
  onSort:           (column: string) => void
}

export function buildCategoryColumns(meta: ColumnMeta): ColumnDef<CategoryWithChildren>[] {
  return [
    // ── Expand toggle ──────────────────────────────────────────────────────────
    {
      id:   "expand",
      size: 44,
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => {
        if (!row.getCanExpand()) {
          return <span className="block w-5 ml-5" />
        }
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={row.getToggleExpandedHandler()}
            className="h-7 w-7 text-text-tertiary hover:text-text-primary"
            aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
          >
            {row.getIsExpanded()
              ? <ChevronDown  className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </Button>
        )
      },
    },

    // ── Name ───────────────────────────────────────────────────────────────────
    {
      accessorKey: "name",
      header: () => (
        <SortableHeader
          label="Name"
          column="name"
          currentSort={meta.currentSort}
          onSort={meta.onSort}
        />
      ),
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => {
        const isChild = row.depth > 0
        return (
          <div className={`flex items-center gap-2 ${isChild ? "pl-6" : ""}`}>
            {row.original.icon && (
              <span className="text-base leading-none">{row.original.icon}</span>
            )}
            <span className={`text-sm ${isChild ? "text-text-secondary" : "font-semibold text-text-primary"}`}>
              {row.original.name}
            </span>
          </div>
        )
      },
    },

    // ── Slug ───────────────────────────────────────────────────────────────────
    {
      accessorKey: "slug",
      header: () => (
        <SortableHeader
          label="Slug"
          column="slug"
          currentSort={meta.currentSort}
          onSort={meta.onSort}
        />
      ),
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => (
        <code className="text-xs bg-surface-subtle border border-border px-1.5 py-0.5 rounded text-text-secondary font-mono">
          {row.original.slug}
        </code>
      ),
    },

    // ── Subcategories ──────────────────────────────────────────────────────────
    {
      id:     "subcategories",
      header: "Subcategories",
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => {
        if (row.depth > 0) return <span className="text-text-tertiary text-sm">—</span>
        const count = (row.original as CategoryWithChildren).children?.length ?? 0
        return count > 0
          ? <Badge variant="secondary" className="text-xs">{count} sub</Badge>
          : <span className="text-text-tertiary text-sm">0</span>
      },
    },

    // ── Sort order ─────────────────────────────────────────────────────────────
    {
      accessorKey: "sortOrder",
      size:        70,
      header: () => (
        <SortableHeader
          label="Order"
          column="sortOrder"
          currentSort={meta.currentSort}
          onSort={meta.onSort}
        />
      ),
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => (
        <span className="text-sm text-text-secondary">{row.original.sortOrder}</span>
      ),
    },

    // ── Status badge ───────────────────────────────────────────────────────────
    {
      id:     "status",
      header: "Status",
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => (
        <Badge
          className={row.original.isActive
            ? "bg-green-50 text-green-700 border border-green-200 text-xs"
            : "bg-surface-subtle text-text-tertiary border border-border text-xs"}
        >
          {row.original.isActive ? "active" : "inactive"}
        </Badge>
      ),
    },

    // ── ⋮ Actions dropdown ─────────────────────────────────────────────────────
    {
      id:   "actions",
      size: 48,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }: { row: Row<CategoryWithChildren> }) => {
        const cat      = row.original
        const isParent = row.depth === 0

        const isToggling = meta.togglingId === cat.id

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

              <DropdownMenuContent align="end" className="w-48">
                {isParent && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem render={<Link href={`/admin/categories/${cat.id}`} />}>
                        <Eye className="w-4 h-4" />
                        Overview
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => meta.onEdit(cat)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>

                  {isParent && (
                    <DropdownMenuItem onClick={() => meta.onAddSubcategory(cat)}>
                      <FolderPlus className="w-4 h-4" />
                      Add Subcategory
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => meta.onToggle(cat)}
                    disabled={meta.isPending}
                  >
                    {cat.isActive
                      ? <><ToggleLeft  className="w-4 h-4" /> Deactivate</>
                      : <><ToggleRight className="w-4 h-4" /> Activate</>}
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => meta.onDelete(cat)}
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
}
