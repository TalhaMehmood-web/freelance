"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import type { SellerGigRow } from "@/types/gigs"

export function useUserGigsQuery(userId: string) {
  return useQuery<SellerGigRow[]>({
    queryKey: ["admin-user-gigs", userId],
    queryFn:  async () => {
      const { data } = await axios.get<{ gigs: SellerGigRow[] }>(`/api/admin/users/${userId}`)
      return data.gigs
    },
    staleTime: 15_000,
  })
}

export function useToggleGigMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ gigId, next }: { gigId: string; next: "active" | "paused" }) => {
      const { adminToggleGigStatus } = await import("@/actions/admin/gigs")
      return adminToggleGigStatus(gigId, next)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user-gigs", userId] }),
  })
}
