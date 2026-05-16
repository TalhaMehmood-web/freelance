import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"

// DELETE /api/seller/portfolio/[id] — remove portfolio item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response

  const { id } = await params

  // TODO: replace with prisma.portfolioItem.delete when schema is added
  void id

  return NextResponse.json({ success: true })
}
