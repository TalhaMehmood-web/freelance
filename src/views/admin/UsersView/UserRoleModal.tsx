"use client"

import { useState, useTransition } from "react"
import { Shield, AlertTriangle, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/shared/utils"
import { assignRole, revokeRole } from "@/actions/admin/users"
import { UserRole } from "@/lib/shared/constants"
import type { AdminUserRow, RoleRow } from "@/types/admin"

interface UserRoleModalProps {
  user:         AdminUserRow | null
  open:         boolean
  onClose:      () => void
  onSaved:      (userId: string, roles: string[]) => void
  availableRoles: RoleRow[]
  isSuperAdmin: boolean
}

const BUILT_IN_COLOR: Record<string, string> = {
  [UserRole.Buyer]:  "bg-blue-50 text-blue-700 border-blue-200",
  [UserRole.Seller]: "bg-brand-50 text-brand-700 border-brand-200",
  [UserRole.Admin]:  "bg-danger-50 text-danger-700 border-danger-200",
}

export function UserRoleModal({
  user, open, onClose, onSaved, availableRoles, isSuperAdmin,
}: UserRoleModalProps) {
  const [localRoles, setLocalRoles]  = useState<string[]>(user?.roles ?? [])
  const [error, setError]            = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Sync when user changes
  if (user && user.roles.join() !== localRoles.join() && !isPending) {
    setLocalRoles(user.roles)
  }

  function handleToggle(slug: string) {
    if (!user || !isSuperAdmin) return
    setError(null)
    const has = localRoles.includes(slug)

    if (!has) {
      startTransition(async () => {
        const result = await assignRole(user.userId, slug)
        if (!result.success) { setError(result.error ?? "Failed to assign role."); return }
        const next = [...localRoles, slug]
        setLocalRoles(next)
        onSaved(user.userId, next)
      })
    } else {
      if (slug === UserRole.Buyer) { setError("Cannot revoke the buyer role."); return }
      startTransition(async () => {
        const result = await revokeRole(user.userId, slug)
        if (!result.success) { setError(result.error ?? "Failed to revoke role."); return }
        const next = localRoles.filter(r => r !== slug)
        setLocalRoles(next)
        onSaved(user.userId, next)
      })
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            Edit Roles
          </DialogTitle>
          <DialogDescription>
            Manage platform roles for{" "}
            <span className="font-medium text-text-primary">{user.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        {!isSuperAdmin && (
          <div className="flex items-center gap-2 text-sm text-text-secondary bg-surface-subtle border border-border rounded-xl px-3 py-2">
            <Lock className="w-4 h-4 shrink-0 text-text-tertiary" />
            Only super admins can change roles.
          </div>
        )}

        <div className="space-y-2 py-1">
          {availableRoles.map(role => {
            const has      = localRoles.includes(role.slug)
            const isLocked = role.slug === UserRole.Buyer
            const disabled = isPending || isLocked || !isSuperAdmin
            const badgeClass = BUILT_IN_COLOR[role.slug] ?? "bg-surface text-text-secondary border-border"

            return (
              <div
                key={role.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-subtle"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className={cn("text-xs font-semibold shrink-0", badgeClass)}>
                    {role.label}
                  </Badge>
                  {isLocked && (
                    <span className="text-xs text-text-tertiary">required</span>
                  )}
                  {role.description && !isLocked && (
                    <span className="text-xs text-text-tertiary truncate">{role.description}</span>
                  )}
                </div>
                <button
                  disabled={disabled}
                  onClick={() => handleToggle(role.slug)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0",
                    has ? "bg-brand-500" : "bg-border",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                      has ? "translate-x-4.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Button variant="outline" className="w-full mt-1" disabled={isPending} onClick={onClose}>
          Done
        </Button>
      </DialogContent>
    </Dialog>
  )
}
