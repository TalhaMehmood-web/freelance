import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { ConversationView } from "@/views/shared/messaging/ConversationView"

export const metadata: Metadata = { title: "Support Conversation | Admin" }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminSupportConversationPage({ params }: PageProps) {
  const [session, { id }] = await Promise.all([requireAuth(UserRole.Admin), params])
  return <ConversationView conversationId={id} currentUserId={session.userId} roleBase="admin" />
}
