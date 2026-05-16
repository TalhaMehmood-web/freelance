import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/server/auth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { updateRole } from "@/actions/admin/permissions"
import { prisma } from "@/lib/server/prisma"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const BodySchema = z.object({
  permissions: z.array(z.string()),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session
  try {
    session = await requireAuth(UserRole.Admin)
    await requireSuperAdmin(session)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const existing = await db.role.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Role not found." }, { status: 404 })
  }

  const result = await updateRole(id, {
    label:       existing.label,
    slug:        existing.slug,
    description: existing.description,
    permissions: parsed.data.permissions,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, data: result.data })
}
