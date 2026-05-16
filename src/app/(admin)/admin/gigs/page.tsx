import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { GigModerationView } from "@/views/admin/GigModerationView"

export const metadata: Metadata = { title: "Gig Moderation | FreelanceHub" }

export default async function GigModerationPage() {
  await requireAuth(UserRole.Admin)
  return <GigModerationView />
}
