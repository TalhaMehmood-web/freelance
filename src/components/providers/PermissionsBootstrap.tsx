"use client"

import { usePermissions } from "@/lib/client/usePermissions"

/**
 * Mount this once inside a protected layout.
 * usePermissions() triggers the fetch on first mount and serves from
 * localStorage cache on subsequent navigations (staleTime: Infinity).
 */
export function PermissionsBootstrap() {
  usePermissions()
  return null
}
