"use server"

import { requireAuth } from "@/lib/server/auth"
import { hasPermission } from "@/lib/server/permissions"
import { prisma } from "@/lib/server/prisma"
import { DEFAULT_ADMIN_PERMISSIONS } from "@/types/admin"
import type { ActionResult } from "@/types/shared"
import type { PermissionKey } from "@/types/admin"

export async function getRolePermissions(role: string): Promise<ActionResult<PermissionKey[]>> {
  await requireAuth("admin")

  const record = await prisma.adminPermission.findUnique({ where: { role } })
  if (!record) {
    // Return defaults if no DB record yet — first-time setup
    return { success: true, data: DEFAULT_ADMIN_PERMISSIONS }
  }
  return { success: true, data: record.permissions as PermissionKey[] }
}

export async function setRolePermissions(
  role: string,
  permissions: PermissionKey[]
): Promise<ActionResult<null>> {
  const session = await requireAuth("admin")
  if (!(await hasPermission(session, "manage_permissions"))) {
    return { success: false, error: "You do not have permission to edit role permissions." }
  }

  await prisma.adminPermission.upsert({
    where:  { role },
    create: { role, permissions, updatedById: session.userId },
    update: { permissions, updatedById: session.userId },
  })
  return { success: true, data: null }
}

export async function setUserPermissionOverride(
  targetUserId: string,
  permission: PermissionKey,
  granted: boolean
): Promise<ActionResult<null>> {
  const session = await requireAuth("admin")
  if (!(await hasPermission(session, "manage_permissions"))) {
    return { success: false, error: "You do not have permission to edit user overrides." }
  }

  await prisma.userPermissionOverride.upsert({
    where:  { userId_permission: { userId: targetUserId, permission } },
    create: { userId: targetUserId, permission, granted, grantedById: session.userId },
    update: { granted, grantedById: session.userId },
  })
  return { success: true, data: null }
}
