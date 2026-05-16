"use client";

import { useState, useTransition } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RolesTable } from "./RolesTable";
import { PermissionsTable } from "./PermissionsTable";
import { ResourcesTable } from "./ResourcesTable";
import { ActionsTable } from "./ActionsTable";
import { seedBuiltInRolesAndPermissions } from "@/actions/admin/permissions";

type Tab = "roles" | "permissions" | "config";

const TABS: { id: Tab; label: string }[] = [
  { id: "roles", label: "Roles" },
  { id: "permissions", label: "Permissions" },
  { id: "config", label: "Resources & Actions" },
];

interface PermissionsViewProps {
  isSuperAdmin: boolean;
}

export function PermissionsView({ isSuperAdmin }: PermissionsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("roles");
  const [seedError, setSeedError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSeed() {
    setSeedError(null);
    startTransition(async () => {
      const result = await seedBuiltInRolesAndPermissions();
      if (!result.success) {
        setSeedError(result.error ?? "Seed failed.");
        return;
      }
      toast.success(
        "Built-in roles, permissions, resources and actions seeded successfully.",
      );
    });
  }

  return (
    <div className="flex flex-col gap-6  min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Roles &amp; Permissions
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage custom roles and fine-grained access control.
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={isPending}
          >
            <Shield className="w-4 h-4" />
            {isPending ? "Seeding…" : "Re-seed Built-ins"}
          </Button>
        )}
      </div>

      {seedError && (
        <div className="flex items-center gap-2 text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {seedError}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-surface-subtle border border-border rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
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
      {activeTab === "permissions" && (
        <PermissionsTable isSuperAdmin={isSuperAdmin} />
      )}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourcesTable isSuperAdmin={isSuperAdmin} />
          <ActionsTable isSuperAdmin={isSuperAdmin} />
        </div>
      )}
    </div>
  );
}
