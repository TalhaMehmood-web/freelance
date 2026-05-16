"use server"

import { prisma } from "@/lib/server/prisma"
import { redirect } from "next/navigation"
import { UserRole } from "@/lib/shared/constants"
import type { Session } from "@/types/shared"

export async function hasPermission(session: Session, permissionKey: string): Promise<boolean> {
  if (!session.grantedRoles.includes(UserRole.Admin)) return false

  // Super admin has every permission implicitly
  if (session.isSuperAdmin) return true

  // User-level override takes precedence
  const override = await prisma.userPermissionOverride.findUnique({
    where: { userId_permission: { userId: session.userId, permission: permissionKey } },
  })
  if (override !== null) return override.granted

  // Check if any of the user's roles grant this permission
  const roles = await prisma.role.findMany({
    where:  { slug: { in: session.grantedRoles } },
    select: { permissions: true },
  })
  return roles.some(r => r.permissions.includes(permissionKey))
}

export async function requirePermission(session: Session, permissionKey: string): Promise<void> {
  const allowed = await hasPermission(session, permissionKey)
  if (!allowed) redirect("/admin/dashboard")
}

export async function requireSuperAdmin(session: Session): Promise<void> {
  if (!session.isSuperAdmin) redirect("/admin/dashboard")
}
