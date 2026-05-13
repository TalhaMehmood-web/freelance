import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { AdminUsersView } from "@/views/admin/UsersView"

export const metadata: Metadata = { title: "User Management | FreelanceHub" }

export default async function AdminUsersPage() {
  await requireAuth("admin")
  return <AdminUsersView />
}
