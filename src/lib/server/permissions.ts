"use server"

import { prisma } from "@/lib/server/prisma"
import { redirect } from "next/navigation"
import { UserRole } from "@/lib/shared/constants"
import type { Session } from "@/types/shared"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function getUserPermissionKeys(userId: string, grantedRoles: string[]): Promise<string[]> {
  const [roles, overrides] = await Promise.all([
    db.role.findMany({
      where:  { slug: { in: grantedRoles } },
      select: { permissions: true },
    }),
    db.userPermissionOverride.findMany({
      where: { userId },
    }),
  ])

  const roleKeys: string[] = roles.flatMap((r: { permissions: string[] }) => r.permissions)
  const granted:  string[] = overrides.filter((o: { granted: boolean }) => o.granted).map((o: { permission: string }) => o.permission)
  const denied:   string[] = overrides.filter((o: { granted: boolean }) => !o.granted).map((o: { permission: string }) => o.permission)

  return [...new Set([...roleKeys, ...granted])].filter(k => !denied.includes(k))
}

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
  if (!allowed) redirect("/no-access")
}

export async function requireSuperAdmin(session: Session): Promise<void> {
  if (!session.isSuperAdmin) redirect("/admin/dashboard")
}
