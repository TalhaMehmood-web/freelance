"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient as axios } from "@/lib/client/axios"
import type { SellerGigRow } from "@/types/gigs"

export interface UserDetailData {
  profile: {
    id:        string
    userId:    string
    username:  string
    fullName:  string
    avatarUrl: string | null
    email:     string
    roles:     string[]
    country:   string | null
    createdAt: string
    bio:       string | null
  }
  sellerProfile: {
    id:               string
    displayName:      string
    professionalTitle: string
    sellerLevel:      string
    avgRating:        number
    totalReviews:     number
    completedOrders:  number
    isFeatured:       boolean
    identityVerified: boolean
  } | null
  gigs: SellerGigRow[]
  stats: {
    gigCount:    number
    activeGigs:  number
    totalOrders: number
    avgRating:   number
  }
}

export function useUserDetailQuery(userId: string) {
  return useQuery<UserDetailData>({
    queryKey: ["admin-user", userId],
    queryFn:  async () => {
      const { data } = await axios.get<UserDetailData>(`/api/admin/users/${userId}`)
      return data
    },
    staleTime: 30_000,
  })
}
