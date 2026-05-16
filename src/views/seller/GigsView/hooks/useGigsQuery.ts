"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/client/axios"
import type { GigsQueryParams, GigsApiResponse } from "../types"

async function fetchGigs(params: GigsQueryParams): Promise<GigsApiResponse> {
  const sp = new URLSearchParams({
    status:  params.status,
    sort:    params.sort,
    search:  params.search,
    page:    String(params.page),
    perPage: String(params.perPage),
  })
  const res = await apiClient.get<GigsApiResponse>(`/api/seller/gigs?${sp.toString()}`)
  return res.data
}

export function useGigsQuery(params: GigsQueryParams) {
  return useQuery({
    queryKey: ["seller-gigs", params],
    queryFn:  () => fetchGigs(params),
    placeholderData: (prev) => prev,
  })
}
