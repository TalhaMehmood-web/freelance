"use server"

import { requireAuth } from "@/lib/server/auth"
import { hasPermission, requireSuperAdmin } from "@/lib/server/permissions"
import { prisma } from "@/lib/server/prisma"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"
import type { AdminUserRow } from "@/types/admin"

export interface GetUsersQuery {
  search?:   string
  role?:     string
  page?:     number
  pageSize?: number
  sortBy?:   "fullName" | "username" | "createdAt"
  sortDir?:  "asc" | "desc"
}

const PAGE_SIZE = 20

export async function getUsers(
  query: GetUsersQuery = {}
): Promise<ActionResult<{ users: AdminUserRow[]; total: number; pageCount: number }>> {
  const session = await requireAuth(UserRole.Admin)
  if (!(await hasPermission(session, "users:read"))) {
    return { success: false, error: "You do not have permission to manage users." }
  }

  const { search, role, page = 1, pageSize = PAGE_SIZE, sortBy = "createdAt", sortDir = "desc" } = query

  type ProfileWhere = NonNullable<Parameters<typeof prisma.profile.findMany>[0]>["where"]
  const where: ProfileWhere = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { username:  { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(role && { roles: { has: role } }),
  }

  const orderBy = sortBy === "fullName"
    ? { fullName: sortDir as "asc" | "desc" }
    : sortBy === "username"
    ? { username: sortDir as "asc" | "desc" }
    : { createdAt: sortDir as "asc" | "desc" }

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: { sellerProfile: { select: { sellerLevel: true } } },
      orderBy,
      skip:  (page - 1) * pageSize,
      take:  pageSize,
    }),
    prisma.profile.count({ where }),
  ])

  const users: AdminUserRow[] = profiles.map(p => ({
    id:           p.id,
    userId:       p.userId,
    username:     p.username,
    fullName:     p.fullName,
    avatarUrl:    p.avatarUrl ?? null,
    email:        "",  // Profile model has no email — stored in Supabase Auth
    roles:        p.roles,
    createdAt:    p.createdAt.toISOString(),
    sellerLevel:  p.sellerProfile?.sellerLevel ?? null,
    isBlocked:    (p as any).isBlocked  ?? false,
    blockedAt:    (p as any).blockedAt  ? (p as any).blockedAt.toISOString() : null,
    lastSignInAt: null,
  }))

  return {
    success: true,
    data: {
      users,
      total,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    },
  }
}

export async function assignRole(
  targetUserId: string,
  roleSlug: string,
): Promise<ActionResult<null>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  const roleExists = await prisma.role.findUnique({ where: { slug: roleSlug } })
  if (!roleExists) return { success: false, error: `Role "${roleSlug}" does not exist.` }

  const profile = await prisma.profile.findUnique({ where: { userId: targetUserId } })
  if (!profile) return { success: false, error: "User not found." }

  if (profile.roles.includes(roleSlug)) return { success: true, data: null }

  await prisma.profile.update({
    where: { userId: targetUserId },
    data:  { roles: { push: roleSlug } },
  })

  return { success: true, data: null }
}

export async function blockUser(targetUserId: string): Promise<ActionResult<null>> {
  const session = await requireAuth(UserRole.Admin)
  if (!(await hasPermission(session, "users:update"))) {
    return { success: false, error: "You do not have permission to manage users." }
  }

  if (session.userId === targetUserId) {
    return { success: false, error: "You cannot block your own account." }
  }

  await prisma.profile.update({
    where: { userId: targetUserId },
    data:  { isBlocked: true, blockedAt: new Date(), blockedBy: session.userId },
  })

  return { success: true, data: null }
}

export async function unblockUser(targetUserId: string): Promise<ActionResult<null>> {
  const session = await requireAuth(UserRole.Admin)
  if (!(await hasPermission(session, "users:update"))) {
    return { success: false, error: "You do not have permission to manage users." }
  }

  await prisma.profile.update({
    where: { userId: targetUserId },
    data:  { isBlocked: false, blockedAt: null, blockedBy: null },
  })

  return { success: true, data: null }
}

export async function revokeRole(
  targetUserId: string,
  roleSlug: string,
): Promise<ActionResult<null>> {
  const session = await requireAuth(UserRole.Admin)
  await requireSuperAdmin(session)

  if (roleSlug === UserRole.Buyer) {
    return { success: false, error: "Cannot revoke the buyer role — all users must retain buyer access." }
  }

  const profile = await prisma.profile.findUnique({ where: { userId: targetUserId } })
  if (!profile) return { success: false, error: "User not found." }

  await prisma.profile.update({
    where: { userId: targetUserId },
    data:  { roles: profile.roles.filter(r => r !== roleSlug) },
  })

  return { success: true, data: null }
}
