import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getOrders, getOrderStatusCounts } from "@/actions/seller/orders"

const QuerySchema = z.object({
  status:  z.string().optional(),
  search:  z.string().max(200).optional(),
  page:    z.coerce.number().int().min(1).optional().default(1),
  sortBy:  z.enum(["dueAt", "createdAt", "amountCents"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
})

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const parsed = QuerySchema.safeParse({
    status:  sp.get("status")  ?? undefined,
    search:  sp.get("search")  ?? undefined,
    page:    sp.get("page")    ?? undefined,
    sortBy:  sp.get("sortBy")  ?? undefined,
    sortDir: sp.get("sortDir") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 })
  }

  // counts param — return counts only
  if (sp.get("counts") === "1") {
    const result = await getOrderStatusCounts()
    if (!result.success) return NextResponse.json({ error: "Failed" }, { status: 500 })
    return NextResponse.json(result.data)
  }

  const result = await getOrders(parsed.data)
  if (!result.success) return NextResponse.json({ error: "Failed" }, { status: 500 })
  return NextResponse.json(result.data)
}
