import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { AdminDashboardView } from "@/views/admin/AdminDashboardView"

export const metadata: Metadata = { title: "Admin Dashboard | FreelanceHub" }

export default async function AdminDashboardPage() {
  await requireAuth("admin")
  return <AdminDashboardView />
}
