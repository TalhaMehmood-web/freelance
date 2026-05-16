"use client"

import { useState } from "react"
import { RolesTable } from "./RolesTable"
import { PermissionsTable } from "./PermissionsTable"
import { ResourcesTable } from "./ResourcesTable"
import { ActionsTable } from "./ActionsTable"

type Tab = "roles" | "permissions" | "config"

const TABS: { id: Tab; label: string }[] = [
  { id: "roles",       label: "Roles"               },
  { id: "permissions", label: "Permissions"          },
  { id: "config",      label: "Resources & Actions"  },
]

interface PermissionsViewProps {
  isSuperAdmin: boolean
}

export function PermissionsView({ isSuperAdmin }: PermissionsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("roles")

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Roles &amp; Permissions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage custom roles and fine-grained access control.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-text-primary shadow-sm border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "roles" && <RolesTable isSuperAdmin={isSuperAdmin} />}
      {activeTab === "permissions" && <PermissionsTable isSuperAdmin={isSuperAdmin} />}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourcesTable isSuperAdmin={isSuperAdmin} />
          <ActionsTable isSuperAdmin={isSuperAdmin} />
        </div>
      )}
    </div>
  )
}
