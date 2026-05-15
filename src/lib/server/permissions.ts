"use server"

import { prisma } from "@/lib/server/prisma"
import type { Session } from "@/types/shared"
import type { PermissionKey } from "@/types/admin"

export async function hasPermission(session: Session, permission: PermissionKey): Promise<boolean> {
  if (!session.grantedRoles.includes("admin")) return false

  const override = await prisma.userPermissionOverride.findUnique({
    where: { userId_permission: { userId: session.userId, permission } },
  })
  if (override !== null) return override.granted

  const rolePerms = await prisma.adminPermission.findUnique({ where: { role: "admin" } })
  return rolePerms?.permissions.includes(permission) ?? false
}
