import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPublicGigs } from "@/actions/gigs"
import { getServerSession } from "@/lib/server/auth"

const QuerySchema = z.object({
  query:         z.string().max(200).optional().default(""),
  categoryId:    z.string().max(100).optional().default(""),
  subcategoryId: z.string().max(100).optional().default(""),
  minPrice:      z.coerce.number().int().min(0).optional(),
  maxPrice:      z.coerce.number().int().min(0).optional(),
  deliveryDays:  z.coerce.number().int().min(1).max(365).optional(),
  sellerLevel:   z.enum(["", "new", "level_1", "level_2", "top_rated"]).optional().default(""),
  rating:        z.coerce.number().min(0).max(5).optional(),
  sort:          z.enum(["relevance", "newest", "orders", "price_asc", "price_desc", "rating"]).optional().default("newest"),
  page:          z.coerce.number().int().min(1).optional().default(1),
  perPage:       z.coerce.number().int().min(1).max(48).optional().default(12),
})

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const parsed = QuerySchema.safeParse({
    query:         sp.get("query")         ?? "",
    categoryId:    sp.get("categoryId")    ?? "",
    subcategoryId: sp.get("subcategoryId") ?? "",
    minPrice:      sp.get("minPrice")      ?? undefined,
    maxPrice:      sp.get("maxPrice")      ?? undefined,
    deliveryDays:  sp.get("deliveryDays")  ?? undefined,
    sellerLevel:   sp.get("sellerLevel")   ?? "",
    rating:        sp.get("rating")        ?? undefined,
    sort:          sp.get("sort")          ?? "newest",
    page:          sp.get("page")          ?? "1",
    perPage:       sp.get("perPage")       ?? "12",
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
  }

  const { query, categoryId, subcategoryId, minPrice, maxPrice, deliveryDays, sellerLevel, rating, sort, page, perPage } = parsed.data

  try {
    const session = await getServerSession()
    const result = await getPublicGigs({
      query:         query || undefined,
      categoryId:    categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      minPrice:      minPrice ? minPrice * 100 : undefined,
      maxPrice:      maxPrice ? maxPrice * 100 : undefined,
      deliveryDays:  deliveryDays || undefined,
      sellerLevel:   sellerLevel || undefined,
      rating:        rating || undefined,
      sort,
      page,
      perPage,
      excludeUserId: session?.userId,
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 })
  }
}
