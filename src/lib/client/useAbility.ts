"use client"

import { useMemo } from "react"
import { usePermissions } from "@/lib/client/usePermissions"
import { buildAbility, type AppAbility } from "@/lib/shared/ability"

export function useUserAbility(): AppAbility {
  const { permissions, isSuperAdmin } = usePermissions()
  return useMemo(
    () => buildAbility(permissions, isSuperAdmin),
    [permissions, isSuperAdmin],
  )
}
