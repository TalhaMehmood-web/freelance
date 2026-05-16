"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreVertical, Lock, Shield, KeyRound, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SortableHeader } from "@/components/ui/data-table"
import type { RoleRow } from "@/types/admin"

const ROLE_COLOR: Record<string, string> = {
  buyer:  "bg-blue-50   text-blue-700   border-blue-200",
  seller: "bg-brand-50  text-brand-700  border-brand-200",
  admin:  "bg-danger-50 text-danger-700 border-danger-200",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

interface ColumnOptions {
  currentSort:  { id: string; desc: boolean }
  onSort:       (col: string) => void
  onEdit:       (role: RoleRow) => void
  onAssign:     (role: RoleRow) => void
  onDelete:     (role: RoleRow) => void
  isSuperAdmin: boolean
}

export function buildRoleColumns({
  currentSort, onSort, onEdit, onAssign, onDelete, isSuperAdmin,
}: ColumnOptions): ColumnDef<RoleRow, any>[] {
  return [
    {
      accessorKey: "label",
      header: () => (
        <SortableHeader label="Role" column="label" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ row }) => {
        const r = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              {r.isBuiltIn
                ? <Lock className="w-4 h-4 text-brand-500" />
                : <Shield className="w-4 h-4 text-brand-500" />
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-text-primary leading-tight">{r.label}</p>
                {r.isBuiltIn && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-surface-subtle text-text-tertiary border-border">
                    built-in
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-tertiary font-mono mt-0.5">{r.slug}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "permissions",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide">Permissions</span>
      ),
      cell: ({ getValue }) => {
        const count = (getValue() as string[]).length
        return (
          <Badge
            variant="outline"
            className={`text-xs ${count > 0 ? ROLE_COLOR[String(count)] ?? "bg-brand-50 text-brand-700 border-brand-200" : "bg-surface-subtle text-text-tertiary border-border"}`}
          >
            <KeyRound className="w-3 h-3 mr-1" />
            {count} {count === 1 ? "permission" : "permissions"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => (
        <SortableHeader label="Updated" column="updatedAt" currentSort={currentSort} onSort={onSort} />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-text-secondary">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <span className="font-medium text-text-secondary text-xs uppercase tracking-wide text-right block">Actions</span>
      ),
      cell: ({ row }) => {
        const r = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger nativeButton>
                <Button size="icon-sm" variant="ghost" aria-label="Open actions">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {isSuperAdmin && (
                  <DropdownMenuItem
                    nativeButton
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onEdit(r)}
                  >
                    <Pencil className="w-4 h-4 text-text-secondary" />
                    Edit Role
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  nativeButton
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onAssign(r)}
                >
                  <KeyRound className="w-4 h-4 text-text-secondary" />
                  Assign Permissions
                </DropdownMenuItem>
                {isSuperAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      nativeButton
                      className="flex items-center gap-2 cursor-pointer text-danger-600 focus:text-danger-700 focus:bg-danger-50"
                      disabled={r.isBuiltIn}
                      onClick={() => !r.isBuiltIn && onDelete(r)}
                    >
                      <Trash2 className="w-4 h-4" />
                      {r.isBuiltIn ? "Cannot delete built-in" : "Delete Role"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
