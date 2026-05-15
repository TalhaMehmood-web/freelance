import type { SellerGigRow } from "@/types/gigs"

export interface GigsQueryParams {
  status:  string
  sort:    string
  search:  string
  page:    number
  perPage: number
}

export interface GigsApiResponse {
  data:      SellerGigRow[]
  total:     number
  page:      number
  pageCount: number
  perPage:   number
}

export const DEFAULT_PARAMS: GigsQueryParams = {
  status:  "",
  sort:    "newest",
  search:  "",
  page:    1,
  perPage: 10,
}
