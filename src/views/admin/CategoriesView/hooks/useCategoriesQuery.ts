"use client"

import { useQuery } from "@tanstack/react-query"
import type { Category } from "@prisma/client"

export type CategoryWithChildren = Category & { children: Category[] }

export interface CategoriesApiResponse {
  data:      CategoryWithChildren[]
  total:     number
  pageCount: number
  page:      number
  perPage:   number
}

export interface CategoriesQueryParams {
  search?:  string
  status?:  string
  sortBy?:  string
  sortDir?: string
  page?:    number
  perPage?: number
}

export const CATEGORIES_QUERY_KEY = ["admin-categories"] as const

export function useCategoriesQuery(params: CategoriesQueryParams = {}) {
  const { search = "", status = "", sortBy = "sortOrder", sortDir = "asc", page = 1, perPage = 20 } = params

  const queryKey = ["admin-categories", { search, status, sortBy, sortDir, page, perPage }] as const

  return useQuery<CategoriesApiResponse>({
    queryKey,
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (search)  sp.set("search",  search)
      if (status)  sp.set("status",  status)
      if (sortBy)  sp.set("sortBy",  sortBy)
      if (sortDir) sp.set("sortDir", sortDir)
      sp.set("page",    String(page))
      sp.set("perPage", String(perPage))
      const res = await fetch(`/api/admin/categories?${sp.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json() as Promise<CategoriesApiResponse>
    },
    staleTime: 30_000,
  })
}
