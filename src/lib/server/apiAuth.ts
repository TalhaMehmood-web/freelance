import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/server/supabase"
import { prisma } from "@/lib/server/prisma"
import { UserRole } from "@/lib/shared/constants"
import type { OrgMemberRole, PlanTier } from "@/lib/shared/constants"
import { ActiveRole } from "@/lib/shared/constants"
import type { Session } from "@/types/shared"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? ""
  if (!header.startsWith("Bearer ")) return null
  return header.slice(7).trim() || null
}

export type ApiAuthResult =
  | { ok: true;  session: Session }
  | { ok: false; response: NextResponse }

export async function requireApiAuth(
  req: NextRequest,
  requiredRole?: UserRole,
): Promise<ApiAuthResult> {
  const token = extractBearer(req)
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const profile = await db.profile.findUnique({
    where:  { userId: user.id },
    select: {
      roles:         true,
      isBlocked:     true,
      isSuperAdmin:  true,
      sellerProfile: { select: { id: true } },
      orgMemberships: {
        where:  { isActive: true },
        select: { orgId: true, role: true, org: { select: { plan: true } } },
        take:   1,
      },
    },
  })

  if (!profile || profile.isBlocked) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (requiredRole && !profile.roles.includes(requiredRole)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const orgMembership = profile.orgMemberships[0] ?? null

  const session: Session = {
    userId:          user.id,
    email:           user.email ?? "",
    grantedRoles:    profile.roles as UserRole[],
    activeRole:      ActiveRole.Buyer,
    isSuperAdmin:    profile.isSuperAdmin,
    orgId:           orgMembership?.orgId ?? null,
    orgRole:         (orgMembership?.role as OrgMemberRole) ?? null,
    orgPlan:         (orgMembership?.org.plan as PlanTier) ?? null,
    sellerProfileId: profile.sellerProfile?.id ?? null,
  }

  return { ok: true, session }
}
