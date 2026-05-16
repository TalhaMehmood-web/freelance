import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { createPermission, deletePermission } from "@/actions/admin/permissions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const VALID_SORT = ["label", "key", "resource", "action"] as const
type SortCol = typeof VALID_SORT[number]

export async function GET(req: NextRequest) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    isBuiltIn:   p.isBuiltIn,
  }))

  return NextResponse.json({
    data,
    total,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
    page,
    perPage,
  })
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const result = await createPermission(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, data: result.data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id") ?? ""
  if (!id) return NextResponse.json({ error: "Missing permission id." }, { status: 400 })

  const result = await deletePermission(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
