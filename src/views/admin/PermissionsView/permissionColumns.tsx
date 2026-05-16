"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Lock, MoreVertical, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortableHeader } from "@/components/ui/data-table"
import type { PermissionRow } from "@/types/admin"

export const RESOURCE_COLOR: Record<string, string> = {
  users:      "bg-blue-50   text-blue-700   border-blue-200",
  gigs:       "bg-brand-50  text-brand-700  border-brand-200",
  payments:   "bg-success-50 text-success-700 border-success-200",
  disputes:   "bg-warning-50 text-warning-700 border-warning-200",
  categories: "bg-purple-50 text-purple-700  border-purple-200",
  coupons:    "bg-orange-50 text-orange-700  border-orange-200",
  orgs:       "bg-cyan-50   text-cyan-700    border-cyan-200",
  audit_logs: "bg-surface-muted text-text-secondary border-border",
  roles:      "bg-danger-50 text-danger-700  border-danger-200",
}

interface ColumnOptions {
  currentSort:  { id: string; desc: boolean }
  onSort:       (col: string) => void
  onDelete:     (perm: PermissionRow) => void
  isSuperAdmin: boolean
}

export function buildPermissionColumns({
  currentSort, onSort, onDelete, isSuperAdmin,
}: ColumnOptions): ColumnDef<PermissionRow, any>[] {
  return [
    {
      accessorKey: "label",
      header: () => (
        <SortableHeader label="Permission" column="label" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="min-w-0">
            <p className="font-medium text-text-primary leading-tight">{p.label}</p>
            <p className="text-xs text-text-tertiary font-mono mt-0.5">{p.key}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "resource",
      header: () => (
        <SortableHeader label="Resource" column="resource" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ getValue }) => {
        const res = getValue() as string
        return (
          <Badge variant="outline" className={`text-xs capitalize ${RESOURCE_COLOR[res] ?? ""}`}>
            {res.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "action",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">Action</span>
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-text-secondary capitalize">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">Description</span>
      ),
      cell: ({ getValue }) => (
        <span className="text-xs text-text-tertiary">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "isBuiltIn",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">Type</span>
      ),
      cell: ({ getValue }) =>
        getValue() ? (
          <Badge variant="outline" className="text-xs bg-surface-subtle text-text-tertiary border-border gap-1">
            <Lock className="w-3 h-3" />
            Built-in
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs bg-brand-50 text-brand-700 border-brand-200">
            Custom
          </Badge>
        ),
    },
    ...(isSuperAdmin ? [{
      id: "actions",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide text-right block">Actions</span>
      ),
      cell: ({ row }: { row: { original: PermissionRow } }) => {
        const p = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger nativeButton>
                <Button size="icon-sm" variant="ghost" aria-label="Open actions">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  nativeButton
                  className={`flex items-center gap-2 cursor-pointer ${
                    p.isBuiltIn
                      ? "opacity-50 cursor-not-allowed"
                      : "text-danger-600 focus:text-danger-700 focus:bg-danger-50"
                  }`}
                  disabled={p.isBuiltIn}
                  onClick={() => !p.isBuiltIn && onDelete(p)}
                >
                  <Trash2 className="w-4 h-4" />
                  {p.isBuiltIn ? "Cannot delete" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    } as ColumnDef<PermissionRow, any>] : []),
  ]
}
