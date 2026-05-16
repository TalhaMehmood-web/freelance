"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client/axios"

export const PERMISSIONS_QUERY_KEY = ["user-permissions"] as const

interface PermissionsResponse {
  permissions:  string[]
  isSuperAdmin: boolean
}

async function fetchPermissions(): Promise<PermissionsResponse> {
  const res = await apiClient.get<PermissionsResponse>("/api/auth/permissions")
  return res.data
}

export function usePermissions() {
  const { data } = useQuery<PermissionsResponse>({
    queryKey:  PERMISSIONS_QUERY_KEY,
    queryFn:   fetchPermissions,
    staleTime: Infinity,
    gcTime:    60 * 60 * 1000, // 1 hour — matches Supabase JWT default expiry
    retry:     false,
  })

  return {
    permissions:  data?.permissions  ?? [],
    isSuperAdmin: data?.isSuperAdmin ?? false,
  }
}

export function useInvalidatePermissions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY })
}
