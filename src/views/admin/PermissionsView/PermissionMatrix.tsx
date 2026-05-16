"use client"

import { Shield, Lock } from "lucide-react"
import { cn } from "@/lib/shared/utils"
import type { PermissionRow } from "@/types/admin"

interface PermissionMatrixProps {
  permissions: PermissionRow[]
  selected: string[]
  onChange: (key: string, checked: boolean) => void
  disabled?: boolean
  isSuperAdmin: boolean
}

export function PermissionMatrix({ permissions, selected, onChange, disabled, isSuperAdmin }: PermissionMatrixProps) {
  const groups = permissions.reduce<Record<string, PermissionRow[]>>((acc, p) => {
    ;(acc[p.resource] ??= []).push(p)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([resource, perms]) => (
        <div key={resource} className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-subtle border-b border-border">
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">{resource}</span>
          </div>
          <div className="divide-y divide-border">
            {perms.map(p => {
              const isSuperOnly = p.key === "roles:manage"
              const isChecked   = selected.includes(p.key)
              const isDisabled  = disabled || (isSuperOnly && !isSuperAdmin)

              return (
                <label
                  key={p.key}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 gap-4 transition-colors",
                    isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-surface-subtle"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isSuperOnly ? (
                      <Lock className="h-4 w-4 text-text-tertiary shrink-0" />
                    ) : (
                      <Shield className={cn("h-4 w-4 shrink-0", isChecked ? "text-brand-500" : "text-text-tertiary")} />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{p.label}</p>
                      <p className="text-xs text-text-secondary truncate">{p.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isSuperOnly && (
                      <span className="text-[10px] font-semibold text-danger-600 bg-danger-50 border border-danger-100 px-1.5 py-0.5 rounded-full">
                        Super Admin
                      </span>
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      disabled={isDisabled}
                      onClick={() => !isDisabled && onChange(p.key, !isChecked)}
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        isChecked ? "bg-brand-500" : "bg-border",
                        isDisabled && "cursor-not-allowed"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                        isChecked ? "translate-x-4.5" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
