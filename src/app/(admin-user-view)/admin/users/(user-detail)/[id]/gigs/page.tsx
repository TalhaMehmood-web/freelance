import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { UserGigsView } from "@/views/admin/UserDashboard/UserGigsView"

export const metadata: Metadata = { title: "User Gigs | FreelanceHub" }

export default async function UserGigsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(UserRole.Admin)
  const { id } = await params
  return <UserGigsView userId={id} />
}
