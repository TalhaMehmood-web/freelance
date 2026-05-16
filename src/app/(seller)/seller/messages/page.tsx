import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { MessagesView } from "@/views/shared/messaging/MessagesView"

export const metadata: Metadata = { title: "Messages | FreelanceHub" }

export default async function SellerMessagesPage() {
  const session = await requireAuth(UserRole.Seller)
  return <MessagesView roleBase="seller" currentUserId={session.userId} />
}
