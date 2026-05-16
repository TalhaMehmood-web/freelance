"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/client/axios"
import type { Category } from "@prisma/client"

export interface CategoryDetailResponse {
  data:      Category & { children: Category[] }
  total:     number
  pageCount: number
  page:      number
  perPage:   number
}

export interface CategoryDetailQueryParams {
  search?:  string
  status?:  string
  sortBy?:  string
  sortDir?: string
  page?:    number
  perPage?: number
}

export function useCategoryDetailQuery(categoryId: string, params: CategoryDetailQueryParams = {}) {
  const { search = "", status = "", sortBy = "sortOrder", sortDir = "asc", page = 1, perPage = 20 } = params

  const queryKey = ["admin-category", categoryId, { search, status, sortBy, sortDir, page, perPage }] as const

  return useQuery<CategoryDetailResponse>({
    queryKey,
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (search)  sp.set("search",  search)
      if (status)  sp.set("status",  status)
      if (sortBy)  sp.set("sortBy",  sortBy)
      if (sortDir) sp.set("sortDir", sortDir)
      sp.set("page",    String(page))
      sp.set("perPage", String(perPage))
      const res = await apiClient.get<CategoryDetailResponse>(`/api/admin/categories/${categoryId}?${sp.toString()}`)
      return res.data
    },
    staleTime: 30_000,
    enabled:  !!categoryId,
  })
}
