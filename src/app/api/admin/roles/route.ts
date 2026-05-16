import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const VALID_SORT = ["label", "slug", "updatedAt", "createdAt"] as const
type SortCol = typeof VALID_SORT[number]

export async function GET(req: NextRequest) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
