import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { UserOrdersView } from "@/views/admin/UserDashboard/UserOrdersView"

export const metadata: Metadata = { title: "User Orders | FreelanceHub" }

export default async function UserOrdersPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(UserRole.Admin)
  const { id } = await params
  return <UserOrdersView userId={id} />
}
