"use client"

import { useState, useTransition } from "react"
import { Shield, Lock, AlertTriangle } from "lucide-react"
import { PERMISSION_KEYS, PERMISSION_LABELS } from "@/types/admin"
import { setRolePermissions } from "@/actions/admin/permissions"
import type { PermissionKey } from "@/types/admin"

interface PermissionsViewProps {
  initialPermissions: PermissionKey[]
}

export function AdminPermissionsView({ initialPermissions }: PermissionsViewProps) {
  const [permissions, setPermissions] = useState<PermissionKey[]>(initialPermissions)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  function handleToggle(key: PermissionKey) {
    if (key === "manage_permissions") return // not editable via UI
    setError(null)
    setSaved(false)
    const next = permissions.includes(key)
      ? permissions.filter(p => p !== key)
      : [...permissions, key]
    setPermissions(next)
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await setRolePermissions("admin", permissions)
      if (!result.success) { setError(result.error ?? "Failed to save permissions."); return }
      setSaved(true)
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Role Permissions</h1>
          <p className="text-sm text-text-secondary mt-1">
            Control what the Admin role can do across the platform.
          </p>
        </div>
        <button
          disabled={isPending}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Shield className="w-4 h-4" />
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Shield className="w-4 h-4 shrink-0" />
          Permissions saved successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Role tab (single for now) */}
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 bg-white rounded-xl border border-border shadow-sm text-sm font-semibold text-danger-600 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Admin
        </div>
      </div>

      {/* Permission matrix */}
      <div className="bg-surface rounded-2xl border border-border shadow-card divide-y divide-border overflow-hidden">
        {PERMISSION_KEYS.map(key => {
          const { label, description } = PERMISSION_LABELS[key]
          const isActive    = permissions.includes(key)
          const isLocked    = key === "manage_permissions"

          return (
            <div key={key} className="flex items-center justify-between px-5 py-4 hover:bg-surface-subtle transition-colors">
              <div className="flex items-center gap-3">
                {isLocked ? (
                  <Lock className="w-4 h-4 text-text-tertiary shrink-0" />
                ) : (
                  <Shield className={`w-4 h-4 shrink-0 ${isActive ? "text-brand-500" : "text-text-tertiary"}`} />
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">{label}</p>
                  <p className="text-xs text-text-secondary">{description}</p>
                </div>
              </div>

              <button
                disabled={isPending || isLocked}
                onClick={() => handleToggle(key)}
                title={isLocked ? "Edit via database only" : undefined}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${
                  isActive ? "bg-brand-500" : "bg-gray-200"
                } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                    isActive ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-text-tertiary">
        <Lock className="inline w-3 h-3 mr-1" />
        <strong>manage_permissions</strong> can only be granted or revoked directly in the database to prevent lockout.
      </p>
    </div>
  )
}
