import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { prisma } from "@/lib/server/prisma"

const SUPPORT_ADMIN_EMAIL = process.env.SUPPORT_ADMIN_EMAIL ?? ""

const CreateConversationSchema = z.object({
  type:            z.enum(["direct", "order", "support"]),
  participantId:   z.string().min(1).optional(),
  orderId:         z.string().optional(),
  initialMessage:  z.string().max(2000).optional(),
})

// GET /api/conversations — list all conversations for current user
export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response
  const { session } = auth

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: session.userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { userId: true, username: true, fullName: true, avatarUrl: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          order: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
  })

  const data = participants.map((p) => {
    const conv = p.conversation
    const lastMsg = conv.messages[0] ?? null
    const unread = conv.messages.filter(
      (m) => !m.isRead && m.senderId !== session.userId
    ).length

    return {
      id:            conv.id,
      type:          conv.type,
      orderId:       conv.orderId ?? null,
      orderTitle:    conv.order?.title ?? null,
      lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
      lastMessage:   lastMsg?.content ?? null,
      unreadCount:   unread,
      createdAt:     conv.createdAt.toISOString(),
      participants:  conv.participants.map((cp) => ({
        userId:     cp.user.userId,
        username:   cp.user.username,
        fullName:   cp.user.fullName,
        avatarUrl:  cp.user.avatarUrl ?? null,
        lastReadAt: cp.lastReadAt?.toISOString() ?? null,
      })),
    }
  })

  return NextResponse.json({ data })
}

// POST /api/conversations — create a new conversation (direct or support)
export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req)
  if (!auth.ok) return auth.response
  const { session } = auth

  const body = await req.json().catch(() => null)
  const parsed = CreateConversationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 })
  }

  const { type, participantId, orderId, initialMessage } = parsed.data

  // Resolve second participant
  let otherUserId: string

  if (type === "support") {
    // Find the platform support admin
    const adminProfile = await prisma.profile.findFirst({
      where: { isSuperAdmin: true },
      select: { userId: true },
    })
    if (!adminProfile) {
      return NextResponse.json({ error: "Support is currently unavailable." }, { status: 503 })
    }
    otherUserId = adminProfile.userId
  } else {
    if (!participantId) {
      return NextResponse.json({ error: "participantId is required for direct conversations." }, { status: 400 })
    }
    const other = await prisma.profile.findUnique({
      where: { userId: participantId },
      select: { userId: true },
    })
    if (!other) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }
    otherUserId = other.userId
  }

  if (otherUserId === session.userId) {
    return NextResponse.json({ error: "Cannot start a conversation with yourself." }, { status: 400 })
  }

  // For direct conversations check if one already exists between these two users
  if (type === "direct") {
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "direct",
        orderId: null,
        participants: {
          every: { userId: { in: [session.userId, otherUserId] } },
        },
      },
      include: { participants: true },
    })
    if (existing && existing.participants.length === 2) {
      return NextResponse.json({ conversationId: existing.id }, { status: 200 })
    }
  }

  // Create conversation + participants + optional first message
  const conversation = await prisma.conversation.create({
    data: {
      type,
      orderId: type === "order" ? orderId ?? null : null,
      lastMessageAt: initialMessage ? new Date() : null,
      participants: {
        create: [
          { userId: session.userId },
          { userId: otherUserId },
        ],
      },
      ...(initialMessage
        ? {
            messages: {
              create: {
                senderId: session.userId,
                content:  initialMessage,
                type:     "text",
              },
            },
          }
        : {}),
    },
  })

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 })
}
