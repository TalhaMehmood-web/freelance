"use server"

import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import type { ActionResult } from "@/types/shared"

export async function adminToggleGigStatus(
  gigId:  string,
  status: "active" | "paused"
): Promise<ActionResult<{ gigId: string; status: string }>> {
  await requireAuth(UserRole.Admin)

  await prisma.gig.update({
    where: { id: gigId },
    data:  { status },
  })

  return { success: true, data: { gigId, status } }
}
