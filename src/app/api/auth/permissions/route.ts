import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { getUserPermissionKeys } from "@/lib/server/permissions"
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response

  const { session } = auth

  if (session.isSuperAdmin) {
    return NextResponse.json({ permissions: [], isSuperAdmin: true })
  }

  const permissions = await getUserPermissionKeys(session.userId, session.grantedRoles)
  return NextResponse.json({ permissions, isSuperAdmin: false })
}
