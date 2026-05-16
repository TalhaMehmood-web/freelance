import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const VALID_SORT = ["label", "slug", "updatedAt", "createdAt"] as const
type SortCol = typeof VALID_SORT[number]

const RoleSchema = z.object({
  label:       z.string().min(1).max(60).trim(),
  slug:        z.string().min(1).max(60).trim().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
  description: z.string().max(300).trim().optional().default(""),
  permissions: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const search  = searchParams.get("search")?.trim() ?? ""
  const rawSort = searchParams.get("sortBy") ?? "createdAt"
  const sortBy: SortCol = VALID_SORT.includes(rawSort as SortCol) ? (rawSort as SortCol) : "createdAt"
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" as const : "desc" as const
  const page    = Math.max(1, Number(searchParams.get("page")) || 1)
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20)

  const where = search
    ? {
        OR: [
          { label: { contains: search, mode: "insensitive" } },
          { slug:  { contains: search, mode: "insensitive" } },
        ],
      }
    : {}

  const [roles, total] = await Promise.all([
    db.role.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    db.role.count({ where }),
  ])

  const data = roles.map((r: any) => ({
    id:          r.id,
    slug:        r.slug,
    label:       r.label,
    description: r.description,
    isBuiltIn:   r.isBuiltIn,
    permissions: r.permissions,
    updatedAt:   r.updatedAt.toISOString(),
    updatedById: r.updatedById,
  }))

  return NextResponse.json({
    data,
    total,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
    page,
    perPage,
  })
}

// POST /api/admin/roles — create role
export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const parsed = RoleSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { label, slug, description, permissions } = parsed.data

  const existing = await prisma.role.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: `A role with slug "${slug}" already exists.` }, { status: 400 })

  const role = await prisma.role.create({
    data: { slug, label, description, permissions, isBuiltIn: false, updatedById: session.userId },
  })

  return NextResponse.json({
    success: true,
    data: {
      id: role.id, slug: role.slug, label: role.label, description: role.description,
      isBuiltIn: role.isBuiltIn, permissions: role.permissions,
      updatedAt: role.updatedAt.toISOString(), updatedById: role.updatedById,
    },
  }, { status: 201 })
}
