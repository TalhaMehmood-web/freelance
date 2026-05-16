import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { MessagesView } from "@/views/shared/messaging/MessagesView"

export const metadata: Metadata = { title: "Messages | FreelanceHub" }

export default async function BuyerMessagesPage() {
  const session = await requireAuth()
  return <MessagesView roleBase="buyer" currentUserId={session.userId} />
}
