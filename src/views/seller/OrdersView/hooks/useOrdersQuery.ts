"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/client/axios"
import type { SellerOrderRow, OrderStatusCounts } from "@/types/seller"

export interface OrdersParams {
  status:  string
  search:  string
  page:    number
  sortBy:  "dueAt" | "createdAt" | "amountCents"
  sortDir: "asc" | "desc"
}

export interface OrdersApiResponse {
  orders:    SellerOrderRow[]
  total:     number
  pageCount: number
}

async function fetchOrders(p: OrdersParams): Promise<OrdersApiResponse> {
  const sp = new URLSearchParams({
    page:    String(p.page),
    sortBy:  p.sortBy,
    sortDir: p.sortDir,
  })
  if (p.status) sp.set("status", p.status)
  if (p.search) sp.set("search", p.search)
  const res = await apiClient.get<OrdersApiResponse>(`/api/seller/orders?${sp.toString()}`)
  return res.data
}

async function fetchCounts(): Promise<OrderStatusCounts> {
  const res = await apiClient.get<OrderStatusCounts>("/api/seller/orders?counts=1")
  return res.data
}

export function useOrdersQuery(params: OrdersParams) {
  return useQuery({
    queryKey:        ["seller-orders", params],
    queryFn:         () => fetchOrders(params),
    placeholderData: (prev) => prev,
  })
}

export function useOrderCountsQuery() {
  return useQuery({
    queryKey:  ["seller-order-counts"],
    queryFn:   fetchCounts,
    staleTime: 30_000,
  })
}
