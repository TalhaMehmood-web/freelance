import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

export async function GET(req: NextRequest) {
  let session
  try {
    session = await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get("unread") === "true"

  const notifications = await prisma.notification.findMany({
    where: {
      userId:  session.userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take:    20,
  })

  const unreadCount = unreadOnly
    ? notifications.length
    : await prisma.notification.count({ where: { userId: session.userId, isRead: false } })

  return NextResponse.json({
    data:        notifications.map(n => ({
      id:        n.id,
      type:      n.type,
      title:     n.title,
      body:      n.body,
      data:      n.data,
      isRead:    n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  })
}

export async function PATCH(req: NextRequest) {
  let session
  try {
    session = await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: session.userId },
      data:  { isRead: true },
    })
  } else {
    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data:  { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}
