"use server"

import { prisma } from "@/lib/server/prisma"
import { Prisma } from "@prisma/client"
import type { NotificationType } from "@prisma/client"
import { UserRole } from "@/lib/shared/constants"

interface AdminNotificationInput {
  type:  NotificationType
  title: string
  body:  string
  data?: Record<string, unknown>
}

export async function createAdminNotification(input: AdminNotificationInput) {
  const admins = await prisma.profile.findMany({
    where:  { roles: { has: UserRole.Admin } },
    select: { userId: true },
  })

  if (admins.length === 0) return

  await prisma.notification.createMany({
    data: admins.map(a => ({
      userId: a.userId,
      type:   input.type,
      title:  input.title,
      body:   input.body,
      data:   (input.data ?? {}) as Prisma.InputJsonValue,
    })),
  })
}
