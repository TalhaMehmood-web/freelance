import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { getRolePermissions } from "@/actions/admin/permissions"
import { AdminPermissionsView } from "@/views/admin/PermissionsView"
import { DEFAULT_ADMIN_PERMISSIONS } from "@/types/admin"
import type { PermissionKey } from "@/types/admin"

export const metadata: Metadata = { title: "Permissions | FreelanceHub" }

export default async function AdminPermissionsPage() {
  await requireAuth("admin")
  const result      = await getRolePermissions("admin")
  const permissions = result.success ? (result.data ?? DEFAULT_ADMIN_PERMISSIONS) : DEFAULT_ADMIN_PERMISSIONS
  return <AdminPermissionsView initialPermissions={permissions as PermissionKey[]} />
}
