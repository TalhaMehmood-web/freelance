"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { apiClient as axios } from "@/lib/client/axios"

export interface AdminGigRow {
  id:                 string
  slug:               string
  title:              string
  status:             string
  coverImageUrl:      string | null
  startingPriceCents: number
  totalOrders:        number
  avgRating:          number
  reviewCount:        number
  isFeatured:         boolean
  createdAt:          string
  category:           { name: string; slug: string }
  seller: {
    username:  string
    fullName:  string
    avatarUrl: string | null
    userId:    string
  }
}

interface GigModerationResponse {
  data:      AdminGigRow[]
  total:     number
  pageCount: number
  page:      number
  perPage:   number
}

export function useGigModerationQuery() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const search  = searchParams.get("search")  ?? ""
  const status  = searchParams.get("status")  ?? ""
  const sortBy  = searchParams.get("sortBy")  ?? "createdAt"
  const sortDir = searchParams.get("sortDir") ?? "desc"
  const page    = Number(searchParams.get("page") || "1")

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (!v) params.delete(k)
      else params.set(k, v)
    })
    if (!("page" in updates)) params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const query = useQuery<GigModerationResponse>({
    queryKey: ["admin-gigs", search, status, sortBy, sortDir, page],
    queryFn:  async () => {
      const params = new URLSearchParams({ sortBy, sortDir, page: String(page) })
      if (search) params.set("search", search)
      if (status) params.set("status", status)
      const { data } = await axios.get<GigModerationResponse>(`/api/admin/gigs?${params}`)
      return data
    },
    staleTime: 15_000,
  })

  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: async ({ gigId, next }: { gigId: string; next: "active" | "paused" }) => {
      const { adminToggleGigStatus } = await import("@/actions/admin/gigs")
      return adminToggleGigStatus(gigId, next)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-gigs"] }),
  })

  return { query, navigate, search, status, sortBy, sortDir, page, toggleMutation }
}
