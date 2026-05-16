import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { prisma } from "@/lib/server/prisma"

type RouteParams = { params: Promise<{ id: string }> }

// PATCH /api/conversations/[id]/read — mark all messages as read for this user
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response
  const { session } = auth
  const { id } = await params

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.userId } },
  })
  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.$transaction([
    prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: session.userId }, isRead: false },
      data:  { isRead: true },
    }),
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId: session.userId } },
      data:  { lastReadAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true })
}
