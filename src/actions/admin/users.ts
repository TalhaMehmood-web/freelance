"use server"

import { requireAuth } from "@/lib/server/auth"
import { hasPermission } from "@/lib/server/permissions"
import type { ActionResult } from "@/types/shared"
import type { AdminUserRow } from "@/types/admin"

export interface GetUsersQuery {
  search?:  string
  role?:    string
  page?:    number
  pageSize?: number
  sortBy?:  "fullName" | "username" | "createdAt"
  sortDir?: "asc" | "desc"
}

const PAGE_SIZE = 20

// MOCK Phase 2 — replace with prisma.profile.findMany + supabase admin.listUsers in Phase 3
const MOCK_USERS: AdminUserRow[] = [
  {
    id: "profile_1", userId: "user_1", username: "john_doe",
    fullName: "John Doe", avatarUrl: null, email: "john@example.com",
    roles: ["buyer", "seller"], createdAt: "2025-01-10T10:00:00Z", sellerLevel: "level_1",
  },
  {
    id: "profile_2", userId: "user_2", username: "jane_smith",
    fullName: "Jane Smith", avatarUrl: null, email: "jane@example.com",
    roles: ["buyer"], createdAt: "2025-02-14T08:30:00Z", sellerLevel: null,
  },
  {
    id: "profile_3", userId: "user_3", username: "admin_talha",
    fullName: "Talha Admin", avatarUrl: null, email: "admin@freelancehub.com",
    roles: ["buyer", "seller", "admin"], createdAt: "2025-01-01T00:00:00Z", sellerLevel: "top_rated",
  },
]

export async function getUsers(
  query: GetUsersQuery = {}
): Promise<ActionResult<{ users: AdminUserRow[]; total: number; pageCount: number }>> {
  const session = await requireAuth("admin")
  if (!(await hasPermission(session, "manage_users"))) {
    return { success: false, error: "You do not have permission to manage users." }
  }

  const { search, role, page = 1, pageSize = PAGE_SIZE, sortBy = "createdAt", sortDir = "desc" } = query

  let filtered = [...MOCK_USERS]

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  }
  if (role) {
    filtered = filtered.filter(u => u.roles.includes(role))
  }

  filtered.sort((a, b) => {
    const av = a[sortBy as keyof AdminUserRow] as string ?? ""
    const bv = b[sortBy as keyof AdminUserRow] as string ?? ""
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  const total     = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const users     = filtered.slice((page - 1) * pageSize, page * pageSize)

  return { success: true, data: { users, total, pageCount } }
}

// MOCK Phase 2 — replace with prisma.profile.update({ where: { userId }, data: { roles: { push: role } } })
export async function assignRole(
  targetUserId: string,
  role: "buyer" | "seller" | "admin"
): Promise<ActionResult<null>> {
  const session = await requireAuth("admin")
  if (!(await hasPermission(session, "manage_users"))) {
    return { success: false, error: "You do not have permission to manage users." }
  }
  return { success: true, data: null }
}

// MOCK Phase 2 — replace with prisma.profile.update + filter out role from array
export async function revokeRole(
  targetUserId: string,
  role: "buyer" | "seller" | "admin"
): Promise<ActionResult<null>> {
  const session = await requireAuth("admin")
  if (!(await hasPermission(session, "manage_users"))) {
    return { success: false, error: "You do not have permission to manage users." }
  }
  if (role === "buyer") {
    return { success: false, error: "Cannot revoke the buyer role — all users must retain buyer access." }
  }
  return { success: true, data: null }
}
