import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { getAllRoles } from "@/actions/admin/permissions"
import { AdminUsersView } from "@/views/admin/UsersView"

export const metadata: Metadata = { title: "User Management | FreelanceHub" }

export default async function AdminUsersPage() {
  const session = await requireAuth(UserRole.Admin)
  const rolesResult = await getAllRoles()
  return (
    <AdminUsersView
      availableRoles={rolesResult.data ?? []}
      isSuperAdmin={session.isSuperAdmin}
    />
  )
}
