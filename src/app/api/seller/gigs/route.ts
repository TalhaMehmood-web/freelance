import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { getSellerGigs } from "@/actions/gigs"
import { z } from "zod"

const QuerySchema = z.object({
  status:  z.enum(["", "active", "paused", "draft"]).optional().default(""),
  sort:    z.enum(["newest", "oldest", "orders", "impressions", "price_asc", "price_desc"]).optional().default("newest"),
  search:  z.string().max(200).optional().default(""),
  page:    z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export async function GET(req: NextRequest) {
  try {
    await requireAuth("seller")
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sp     = req.nextUrl.searchParams
  const parsed = QuerySchema.safeParse({
    status:  sp.get("status")  ?? "",
    sort:    sp.get("sort")    ?? "newest",
    search:  sp.get("search")  ?? "",
    page:    sp.get("page")    ?? "1",
    perPage: sp.get("perPage") ?? "10",
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const { status, sort, search, page, perPage } = parsed.data

  const result = await getSellerGigs()
  if (!result.success || !result.data) {
    return NextResponse.json({ error: result.error ?? "Failed to load gigs" }, { status: 500 })
  }

  let rows = result.data

  if (status) rows = rows.filter(g => g.status === status)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(g => g.title.toLowerCase().includes(q))
  }

  rows.sort((a, b) => {
    switch (sort) {
      case "oldest":      return a.createdAt.localeCompare(b.createdAt)
      case "orders":      return b.stats.orders      - a.stats.orders
      case "impressions": return b.stats.impressions - a.stats.impressions
      case "price_asc":   return a.packages.startingPriceCents - b.packages.startingPriceCents
      case "price_desc":  return b.packages.startingPriceCents - a.packages.startingPriceCents
      default:            return b.createdAt.localeCompare(a.createdAt)
    }
  })

  const total     = rows.length
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const data      = rows.slice((page - 1) * perPage, page * perPage)

  return NextResponse.json({ data, total, page, pageCount, perPage })
}
