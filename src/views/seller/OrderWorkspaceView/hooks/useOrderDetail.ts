"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client/axios"
import { toast } from "sonner"
import type { OrderDetail } from "@/types/orders"

export function useOrderDetail(orderId: string) {
  return useQuery<OrderDetail>({
    queryKey: ["seller-order", orderId],
    queryFn:  () =>
      apiClient.get<OrderDetail>(`/api/seller/orders/${orderId}`).then((r) => r.data),
  })
}

export function useAcceptOrder(orderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post(`/api/seller/orders/${orderId}/accept`),
    onSuccess:  () => {
      toast.success("Order accepted — work has started!")
      qc.invalidateQueries({ queryKey: ["seller-order", orderId] })
      qc.invalidateQueries({ queryKey: ["seller-orders"] })
      qc.invalidateQueries({ queryKey: ["seller-order-counts"] })
    },
    onError: () => toast.error("Failed to accept order. Please try again."),
  })
}

export interface DeliverPayload {
  message:     string
  attachments: string[]
}

export function useDeliverOrder(orderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeliverPayload) =>
      apiClient.post(`/api/seller/orders/${orderId}/deliver`, payload),
    onSuccess: () => {
      toast.success("Delivery submitted!")
      qc.invalidateQueries({ queryKey: ["seller-order", orderId] })
      qc.invalidateQueries({ queryKey: ["seller-orders"] })
      qc.invalidateQueries({ queryKey: ["seller-order-counts"] })
    },
    onError: () => toast.error("Failed to submit delivery. Please try again."),
  })
}

export function useCancelOrder(orderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post(`/api/seller/orders/${orderId}/cancel`),
    onSuccess:  () => {
      toast.success("Order cancelled.")
      qc.invalidateQueries({ queryKey: ["seller-order", orderId] })
      qc.invalidateQueries({ queryKey: ["seller-orders"] })
      qc.invalidateQueries({ queryKey: ["seller-order-counts"] })
    },
    onError: () => toast.error("Failed to cancel order. Please try again."),
  })
}
