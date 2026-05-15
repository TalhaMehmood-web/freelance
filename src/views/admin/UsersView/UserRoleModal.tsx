"use client"

import { useState, useTransition } from "react"
import { Shield, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { assignRole, revokeRole } from "@/actions/admin/users"
import type { AdminUserRow } from "@/types/admin"

interface UserRoleModalProps {
  user:     AdminUserRow | null
  open:     boolean
  onClose:  () => void
  onSaved:  (userId: string, roles: string[]) => void
}

const ALL_ROLES = ["buyer", "seller", "admin"] as const
type Role = (typeof ALL_ROLES)[number]

const ROLE_META: Record<Role, { label: string; color: string }> = {
  buyer:  { label: "Buyer",  color: "bg-blue-50 text-blue-700 border-blue-200" },
  seller: { label: "Seller", color: "bg-brand-50 text-brand-700 border-brand-200" },
  admin:  { label: "Admin",  color: "bg-danger-50 text-danger-700 border-danger-200" },
}

export function UserRoleModal({ user, open, onClose, onSaved }: UserRoleModalProps) {
  const [localRoles, setLocalRoles] = useState<string[]>(user?.roles ?? [])
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Sync state when user changes
  if (user && user.roles.join() !== localRoles.join() && !isPending) {
    setLocalRoles(user.roles)
  }

  function handleToggle(role: Role) {
    if (!user) return
    setError(null)
    const has = localRoles.includes(role)

    if (!has) {
      // Assign
      startTransition(async () => {
        const result = await assignRole(user.userId, role)
        if (!result.success) { setError(result.error ?? "Failed to assign role."); return }
        const next = [...localRoles, role]
        setLocalRoles(next)
        onSaved(user.userId, next)
      })
    } else {
      if (role === "buyer") { setError("Cannot revoke the buyer role."); return }
      // Revoke
      startTransition(async () => {
        const result = await revokeRole(user.userId, role)
        if (!result.success) { setError(result.error ?? "Failed to revoke role."); return }
        const next = localRoles.filter(r => r !== role)
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
            Manage platform roles for <span className="font-medium text-text-primary">{user.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {ALL_ROLES.map(role => {
            const has  = localRoles.includes(role)
            const meta = ROLE_META[role]
            return (
              <div
                key={role}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-subtle"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs font-semibold ${meta.color}`}>
                    {meta.label}
                  </Badge>
                  {role === "buyer" && (
                    <span className="text-xs text-text-tertiary">required</span>
                  )}
                </div>
                <button
                  disabled={isPending || role === "buyer"}
                  onClick={() => handleToggle(role)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    has ? "bg-brand-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                      has ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
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

        <Button
          variant="outline"
          className="w-full mt-1"
          disabled={isPending}
          onClick={onClose}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  )
}
