import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"

// PATCH /api/seller/settings/availability
export async function PATCH(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response

  // TODO: replace with prisma.sellerProfile.update when schema is finalized
  void await req.json()

  return NextResponse.json({ success: true })
}
