import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { AdminDisputesView } from "@/views/admin/DisputesView"

export const metadata: Metadata = { title: "Disputes | FreelanceHub" }

export default async function AdminDisputesPage() {
  await requireAuth(UserRole.Admin)
  return <AdminDisputesView />
}
