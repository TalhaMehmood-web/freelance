import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const BodySchema = z.object({ permissions: z.array(z.string()) })

// PATCH /api/admin/roles/[id]/permissions — update permissions list on a role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { id } = await params

  const parsed = BodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const existing = await db.role.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Role not found." }, { status: 404 })

  const role = await db.role.update({
    where: { id },
    data:  { permissions: parsed.data.permissions, updatedById: session.userId },
  })

  return NextResponse.json({
    success: true,
    data: {
      id: role.id, slug: role.slug, label: role.label, description: role.description,
      isBuiltIn: role.isBuiltIn, permissions: role.permissions,
      updatedAt: role.updatedAt.toISOString(), updatedById: role.updatedById,
    },
  })
}
