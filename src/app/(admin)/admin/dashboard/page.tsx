import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { AdminDashboardView } from "@/views/admin/AdminDashboardView"

export const metadata: Metadata = { title: "Admin Dashboard | FreelanceHub" }

export default async function AdminDashboardPage() {
  await requireAuth(UserRole.Admin)
  return <AdminDashboardView />
}
