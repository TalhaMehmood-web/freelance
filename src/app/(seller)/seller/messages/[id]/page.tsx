import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { ConversationView } from "@/views/shared/messaging/ConversationView"

export const metadata: Metadata = { title: "Conversation | FreelanceHub" }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SellerConversationPage({ params }: PageProps) {
  const [session, { id }] = await Promise.all([requireAuth(UserRole.Seller), params])
  return <ConversationView conversationId={id} currentUserId={session.userId} roleBase="seller" />
}
