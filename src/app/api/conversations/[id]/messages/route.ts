import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { prisma } from "@/lib/server/prisma"
import { createUserNotification } from "@/lib/server/notifications"

const PAGE_SIZE = 30

const SendMessageSchema = z.object({
  content:     z.string().min(1).max(10000),
  attachments: z.array(z.string()).max(5).optional().default([]),
})

type RouteParams = { params: Promise<{ id: string }> }

async function assertParticipant(conversationId: string, userId: string) {
  const p = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  return !!p
}

// GET /api/conversations/[id]/messages — paginated history (cursor-based)
export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response
  const { session } = auth
  const { id } = await params

  const isMember = await assertParticipant(id, session.userId)
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const cursor = new URL(req.url).searchParams.get("cursor") ?? undefined

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sender: { select: { userId: true, username: true, fullName: true, avatarUrl: true } },
    },
    orderBy:  { createdAt: "desc" },
    take:     PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore    = messages.length > PAGE_SIZE
  const items      = hasMore ? messages.slice(0, PAGE_SIZE) : messages
  const nextCursor = hasMore ? items[items.length - 1].id : null

  const data = items.reverse().map((m) => ({
    id:             m.id,
    conversationId: m.conversationId,
    senderId:       m.senderId,
    content:        m.content,
    attachments:    m.attachments as string[],
    type:           m.type,
    isRead:         m.isRead,
    createdAt:      m.createdAt.toISOString(),
    sender: {
      userId:   m.sender.userId,
      username: m.sender.username,
      fullName: m.sender.fullName,
      avatarUrl: m.sender.avatarUrl ?? null,
    },
  }))

  return NextResponse.json({ data, nextCursor, hasMore })
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response
  const { session } = auth
  const { id } = await params

  const isMember = await assertParticipant(id, session.userId)
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body   = await req.json().catch(() => null)
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 })
  }

  const { content, attachments } = parsed.data

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: id,
        senderId:       session.userId,
        content,
        attachments:    attachments ?? [],
        type:           "text",
      },
      include: {
        sender: { select: { userId: true, username: true, fullName: true, avatarUrl: true } },
      },
    }),
    prisma.conversation.update({
      where: { id },
      data:  { lastMessageAt: new Date() },
    }),
  ])

  // Fire-and-forget notifications to all other participants
  prisma.conversationParticipant.findMany({
    where: { conversationId: id, NOT: { userId: session.userId } },
    select: { userId: true },
  }).then((recipients) =>
    Promise.all(
      recipients.map((r) =>
        createUserNotification(r.userId, {
          type:  "new_message",
          title: "New message",
          body:  content.length > 80 ? content.slice(0, 80) + "…" : content,
          data:  { conversationId: id },
        })
      )
    )
  ).catch(() => null)

  return NextResponse.json({
    id:             message.id,
    conversationId: message.conversationId,
    senderId:       message.senderId,
    content:        message.content,
    attachments:    message.attachments as string[],
    type:           message.type,
    isRead:         message.isRead,
    createdAt:      message.createdAt.toISOString(),
    sender: {
      userId:    message.sender.userId,
      username:  message.sender.username,
      fullName:  message.sender.fullName,
      avatarUrl: message.sender.avatarUrl ?? null,
    },
  }, { status: 201 })
}
