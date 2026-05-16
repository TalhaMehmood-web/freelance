import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { PermissionsView } from "@/views/admin/PermissionsView"

export const metadata: Metadata = { title: "Roles & Permissions | FreelanceHub" }

export default async function AdminPermissionsPage() {
  const session = await requireAuth(UserRole.Admin)

  return (
    <PermissionsView isSuperAdmin={session.isSuperAdmin} />
  )
}
