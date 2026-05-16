"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import type { GigCard } from "@/types/gigs"

export interface PublicGigsParams {
  query?:         string
  categoryId?:    string
  subcategoryId?: string
  minPrice?:      string
  maxPrice?:      string
  deliveryDays?:  string
  sellerLevel?:   string
  minRating?:     string
  sort?:          string
  perPage?:       number
}

export interface PublicGigsResponse {
  data:      GigCard[]
  total:     number
  page:      number
  pageCount: number
  perPage:   number
}

export function usePublicGigsQuery(params: PublicGigsParams) {
  return useInfiniteQuery<PublicGigsResponse>({
    queryKey: ["public-gigs", params],
    queryFn:  async ({ pageParam }) => {
      const sp = new URLSearchParams()
      if (params.query)         sp.set("query",         params.query)
      if (params.categoryId)    sp.set("categoryId",    params.categoryId)
      if (params.subcategoryId) sp.set("subcategoryId", params.subcategoryId)
      if (params.minPrice)      sp.set("minPrice",      params.minPrice)
      if (params.maxPrice)      sp.set("maxPrice",      params.maxPrice)
      if (params.deliveryDays)  sp.set("deliveryDays",  params.deliveryDays)
      if (params.sellerLevel)   sp.set("sellerLevel",   params.sellerLevel)
      if (params.minRating)     sp.set("rating",        params.minRating)
      if (params.sort)          sp.set("sort",          params.sort)
      sp.set("page",    String(pageParam ?? 1))
      sp.set("perPage", String(params.perPage ?? 12))

      const res = await axios.get<PublicGigsResponse>(`/api/gigs?${sp.toString()}`)
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.pageCount ? last.page + 1 : undefined,
    staleTime: 30_000,
  })
}
