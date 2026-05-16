import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const VALID_SORT = ["label", "key", "resource", "action"] as const
type SortCol = typeof VALID_SORT[number]

const PermissionSchema = z.object({
  label:       z.string().min(1, "Label is required").max(80).trim(),
  key:         z.string().min(1, "Key is required").max(80).trim()
               .regex(/^[a-z0-9_]+:[a-z0-9_]+$/, "Key must be resource:action format (lowercase)"),
  resource:    z.string().min(1, "Resource is required").max(60).trim()
               .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  action:      z.string().min(1, "Action is required").max(60).trim()
               .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscores only"),
  description: z.string().max(300).trim().optional().default(""),
  roleIds:     z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get("search")?.trim() ?? ""
  const resource = searchParams.get("resource") ?? ""
  const rawSort  = searchParams.get("sortBy") ?? "resource"
  const sortBy: SortCol = VALID_SORT.includes(rawSort as SortCol) ? (rawSort as SortCol) : "resource"
  const sortDir  = searchParams.get("sortDir") === "desc" ? "desc" as const : "asc" as const
  const page     = Math.max(1, Number(searchParams.get("page")) || 1)
  const perPage  = Math.min(100, Number(searchParams.get("perPage")) || 20)

  const where: Record<string, unknown> = {}
  if (resource) where.resource = resource
  if (search) {
    where.OR = [
      { label: { contains: search, mode: "insensitive" } },
      { key:   { contains: search, mode: "insensitive" } },
    ]
  }

  const [permissions, total] = await Promise.all([
    db.permission.findMany({
      where,
      orderBy: [{ resource: "asc" }, { [sortBy]: sortDir }],
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    db.permission.count({ where }),
  ])

  const data = permissions.map((p: any) => ({
    id:          p.id,
    key:         p.key,
    label:       p.label,
    description: p.description,
    resource:    p.resource,
    action:      p.action,
  }))

  return NextResponse.json({ data, total, pageCount: Math.max(1, Math.ceil(total / perPage)), page, perPage })
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const parsed = PermissionSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { label, key, resource, action, description, roleIds } = parsed.data

  const existing = await prisma.permission.findUnique({ where: { key } })
  if (existing) return NextResponse.json({ error: `A permission with key "${key}" already exists.` }, { status: 400 })

  const permission = await prisma.permission.create({ data: { key, label, description, resource, action } })

  const adminRole = await prisma.role.findUnique({ where: { slug: UserRole.Admin } })
  const autoAssignRoleIds = new Set(roleIds)
  if (adminRole) autoAssignRoleIds.add(adminRole.id)

  if (autoAssignRoleIds.size > 0) {
    const roles = await prisma.role.findMany({ where: { id: { in: [...autoAssignRoleIds] } }, select: { id: true, permissions: true } })
    await Promise.all(roles.map((r: { id: string; permissions: string[] }) =>
      prisma.role.update({ where: { id: r.id }, data: { permissions: [...new Set([...r.permissions, key])] } })
    ))
  }

  return NextResponse.json({ success: true, data: { id: permission.id, key: permission.key, label: permission.label, description: permission.description, resource: permission.resource, action: permission.action } }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id") ?? ""

  // Bulk delete-all (no id param)
  if (!id) {
    const allPerms = await db.permission.findMany({ select: { key: true } })
    const allKeys: string[] = allPerms.map((p: { key: string }) => p.key)
    if (allKeys.length > 0) {
      const roles = await db.role.findMany({ select: { id: true, permissions: true } })
      await Promise.all(
        roles.map((r: { id: string; permissions: string[] }) =>
          db.role.update({ where: { id: r.id }, data: { permissions: r.permissions.filter((k: string) => !allKeys.includes(k)) } })
        )
      )
      await db.permission.deleteMany({})
    }
    return NextResponse.json({ success: true, deleted: allKeys.length })
  }

  const existing = await prisma.permission.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Permission not found." }, { status: 404 })

  const rolesWithPerm = await prisma.role.findMany({ where: { permissions: { has: existing.key } }, select: { id: true, permissions: true } })
  await Promise.all(rolesWithPerm.map((r: { id: string; permissions: string[] }) =>
    prisma.role.update({ where: { id: r.id }, data: { permissions: r.permissions.filter((p: string) => p !== existing.key) } })
  ))
  await prisma.permission.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
