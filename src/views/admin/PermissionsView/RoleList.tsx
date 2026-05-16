"use client"

import { useTransition } from "react"
import { Shield, Trash2, Pencil, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/shared/utils"
import { deleteRole } from "@/actions/admin/permissions"
import type { RoleRow } from "@/types/admin"

interface RoleListProps {
  roles:        RoleRow[]
  selected:     RoleRow | null
  onSelect:     (role: RoleRow) => void
  onEdit:       (role: RoleRow) => void
  onDeleted:    (id: string) => void
  isSuperAdmin: boolean
}

const ROLE_COLOR: Record<string, string> = {
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  seller: "bg-brand-50 text-brand-700 border-brand-200",
  admin:  "bg-danger-50 text-danger-700 border-danger-200",
}

export function RoleList({ roles, selected, onSelect, onEdit, onDeleted, isSuperAdmin }: RoleListProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(role: RoleRow) {
    startTransition(async () => {
      const result = await deleteRole(role.id)
      if (result.success) onDeleted(role.id)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {roles.map(role => {
        const isSelected = selected?.id === role.id
        const badgeClass = ROLE_COLOR[role.slug] ?? "bg-surface text-text-secondary border-border"

        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelect(role)}
            className={cn(
              "w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all",
              isSelected
                ? "border-brand-300 bg-brand-50 shadow-sm"
                : "border-border bg-surface hover:bg-surface-subtle"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                isSelected ? "bg-brand-100" : "bg-surface-subtle"
              )}>
                {role.isBuiltIn
                  ? <Lock className="w-3.5 h-3.5 text-text-tertiary" />
                  : <Shield className={cn("w-3.5 h-3.5", isSelected ? "text-brand-500" : "text-text-tertiary")} />
                }
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary truncate">{role.label}</span>
                  {role.isBuiltIn && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-text-tertiary shrink-0">
                      built-in
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-tertiary truncate">{role.permissions.length} permissions</p>
              </div>
            </div>

            {isSuperAdmin && (
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={e => e.stopPropagation()}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-text-tertiary hover:text-text-primary"
                  onClick={() => onEdit(role)}
                  title="Edit role"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {!role.isBuiltIn && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-danger-500 hover:text-danger-700 hover:bg-danger-50"
                    onClick={() => handleDelete(role)}
                    disabled={isPending}
                    title="Delete role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
