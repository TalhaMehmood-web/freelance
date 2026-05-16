"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient as axios } from "@/lib/client/axios"
import { ActiveRole } from "@/lib/shared/constants"

export interface AdminOrderRow {
  id:          string
  title:       string
  status:      string
  priceCents:  number
  createdAt:   string
  completedAt: string | null
  cancelledAt: string | null
  gigTitle:    string | null
  gigSlug:     string | null
  client:     { username: string; fullName: string; avatarUrl: string | null }
  freelancer: { username: string; fullName: string; avatarUrl: string | null }
}

interface OrdersResponse {
  data:      AdminOrderRow[]
  total:     number
  pageCount: number
  page:      number
  perPage:   number
}

export function useUserOrdersQuery(userId: string, role: ActiveRole, page: number) {
  return useQuery<OrdersResponse>({
    queryKey: ["admin-user-orders", userId, role, page],
    queryFn:  async () => {
      const { data } = await axios.get<OrdersResponse>(
        `/api/admin/users/${userId}/orders?role=${role}&page=${page}`
      )
      return data
    },
    staleTime: 15_000,
  })
}

export function useOrderStatusMutation(userId: string, role: ActiveRole, page: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user-orders", userId, role, page] }),
  })
}
