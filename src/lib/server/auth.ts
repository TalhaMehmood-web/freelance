import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createSupabaseServerClient } from "./supabase"
import { prisma } from "./prisma"
import type { Session } from "../shared/types"
import { UserRole, ActiveRole } from "../shared/constants"
import type { OrgMemberRole, PlanTier } from "../shared/constants"

export async function getServerSession(): Promise<Session | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const cookieStore = await cookies()
    const activeRoleCookie = cookieStore.get("__role")?.value
    const activeRole = activeRoleCookie === ActiveRole.Seller ? ActiveRole.Seller : ActiveRole.Buyer

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await (prisma.profile.findUnique as any)({
      where: { userId: user.id },
      select: {
        id: true,
        roles: true,
        isBlocked: true,
        isSuperAdmin: true,
        sellerProfile: { select: { id: true } },
        orgMemberships: {
          where: { isActive: true },
          select: {
            orgId: true,
            role: true,
            org: { select: { plan: true } },
          },
          take: 1,
        },
      },
    }) as {
      id: string
      roles: string[]
      isBlocked: boolean
      isSuperAdmin: boolean
      sellerProfile: { id: string } | null
      orgMemberships: { orgId: string; role: string; org: { plan: string } }[]
    } | null

    if (!profile) return null

    const orgMembership = profile.orgMemberships[0] ?? null

    return {
      userId: user.id,
      email: user.email ?? "",
      grantedRoles: profile.roles as UserRole[],
      activeRole,
      isSuperAdmin: profile.isSuperAdmin,
      orgId: orgMembership?.orgId ?? null,
      orgRole: (orgMembership?.role as OrgMemberRole) ?? null,
      orgPlan: (orgMembership?.org.plan as PlanTier) ?? null,
      sellerProfileId: profile.sellerProfile?.id ?? null,
    }
  } catch {
    return null
  }
}

export async function requireAuth(requiredRole?: UserRole): Promise<Session> {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  // Skip block check for admins (they need to be able to log in to unblock users)
  if (!session.grantedRoles.includes(UserRole.Admin)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await (prisma.profile.findUnique as any)({
      where:  { userId: session.userId },
      select: { isBlocked: true },
    }) as { isBlocked: boolean } | null
    if (profile?.isBlocked) {
      redirect("/suspended")
    }
  }

  if (requiredRole === UserRole.Admin && !session.grantedRoles.includes(UserRole.Admin)) {
    redirect("/buyer/dashboard")
  }

  if (requiredRole === UserRole.Seller && !session.grantedRoles.includes(UserRole.Seller)) {
    redirect("/seller-setup/step-1")
  }

  return session
}

export async function requireOrgAccess(
  slug: string,
  minRole: OrgMemberRole = "viewer"
): Promise<Session & { orgId: string }> {
  const session = await getServerSession()

  if (!session) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!org) redirect("/buyer/dashboard")

  const membership = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId: org.id, userId: session.userId } },
    select: { role: true, isActive: true },
  })

  if (!membership?.isActive) redirect("/buyer/dashboard")

  const roleOrder: OrgMemberRole[] = ["viewer", "billing_manager", "member", "admin", "owner"]
  const memberRoleIndex = roleOrder.indexOf(membership.role as OrgMemberRole)
  const requiredRoleIndex = roleOrder.indexOf(minRole)

  if (memberRoleIndex < requiredRoleIndex) redirect(`/org/${slug}/dashboard`)

  return { ...session, orgId: org.id }
}
