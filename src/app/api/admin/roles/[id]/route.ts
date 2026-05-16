import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { z } from "zod"

const RoleSchema = z.object({
  label:       z.string().min(1).max(60).trim(),
  slug:        z.string().min(1).max(60).trim().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
  description: z.string().max(300).trim().optional().default(""),
  permissions: z.array(z.string()).default([]),
})

// PUT /api/admin/roles/[id] — update role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { id } = await params

  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Role not found." }, { status: 404 })

  const parsed = RoleSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { label, slug, description, permissions } = parsed.data

  if (existing.isBuiltIn && slug !== existing.slug) {
    return NextResponse.json({ error: "Cannot change the slug of a built-in role." }, { status: 400 })
  }

  const slugConflict = await prisma.role.findFirst({ where: { slug, NOT: { id } } })
  if (slugConflict) return NextResponse.json({ error: `A role with slug "${slug}" already exists.` }, { status: 400 })

  const role = await prisma.role.update({
    where: { id },
    data:  { label, slug, description, permissions, updatedById: session.userId },
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

// DELETE /api/admin/roles/[id] — delete role
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { id } = await params

  const existing = await prisma.role.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Role not found." }, { status: 404 })
  if (existing.isBuiltIn) return NextResponse.json({ error: "Built-in roles cannot be deleted." }, { status: 400 })

  await prisma.role.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
