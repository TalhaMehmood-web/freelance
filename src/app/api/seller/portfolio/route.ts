import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import type { AddPortfolioInput, PortfolioItem } from "@/types/portfolio"

// POST /api/seller/portfolio — add portfolio item (mocked until DB schema added)
export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response

  const body: AddPortfolioInput = await req.json()

  if (!body.title || body.title.trim().length < 3) {
    return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 })
  }

  const newItem: PortfolioItem = {
    id:          `port_${Date.now()}`,
    title:       body.title.trim(),
    description: body.description?.trim() ?? null,
    externalUrl: body.externalUrl?.trim() || null,
    categoryId:  body.categoryId ?? null,
    createdAt:   new Date().toISOString(),
  }

  return NextResponse.json({ success: true, data: newItem }, { status: 201 })
}
