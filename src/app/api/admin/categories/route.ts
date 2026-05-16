import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { CategoryFormSchema } from "@/schemas/admin/categories"

const VALID_SORT_COLS = ["name", "slug", "sortOrder", "createdAt"] as const
type SortCol = typeof VALID_SORT_COLS[number]

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const search  = searchParams.get("search")?.trim() ?? ""
  const status  = searchParams.get("status") ?? ""
  const rawSort = searchParams.get("sortBy") ?? "sortOrder"
  const sortBy: SortCol = VALID_SORT_COLS.includes(rawSort as SortCol) ? (rawSort as SortCol) : "sortOrder"
  const sortDir = searchParams.get("sortDir") === "desc" ? "desc" as const : "asc" as const
  const page    = Math.max(1, Number(searchParams.get("page"))    || 1)
  const perPage = Math.min(100, Number(searchParams.get("perPage")) || 20)

  const where = {
    parentId: null as null,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(status === "active"   ? { isActive: true  } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: { children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
      orderBy: { [sortBy]: sortDir },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    prisma.category.count({ where }),
  ])

  return NextResponse.json({
    data:      categories,
    total,
    pageCount: Math.ceil(total / perPage),
    page,
    perPage,
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  const parsed = CategoryFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 })
  }

  const { name, slug, parentId, icon, sortOrder } = parsed.data

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 })
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      icon:      icon   || null,
      sortOrder: sortOrder ?? 0,
      parentId:  parentId || null,
    },
  })

  return NextResponse.json({ data: category }, { status: 201 })
}
