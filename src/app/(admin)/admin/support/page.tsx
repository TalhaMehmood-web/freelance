import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { MessagesView } from "@/views/shared/messaging/MessagesView"

export const metadata: Metadata = { title: "Support Inbox | Admin" }

export default async function AdminSupportPage() {
  const session = await requireAuth(UserRole.Admin)
  return (
    <div className="p-6 h-full">
      <MessagesView roleBase="admin" currentUserId={session.userId} />
    </div>
  )
}
