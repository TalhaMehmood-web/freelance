import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { CategoryUpdateSchema } from "@/schemas/admin/categories"

interface RouteParams {
  params: Promise<{ id: string }>
}

const VALID_CHILD_SORT = ["name", "slug", "sortOrder", "createdAt"] as const
type ChildSortCol = typeof VALID_CHILD_SORT[number]

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const search   = searchParams.get("search")?.trim() ?? ""
  const status   = searchParams.get("status") ?? ""
  const rawSort  = searchParams.get("sortBy") ?? "sortOrder"
  const sortBy: ChildSortCol = VALID_CHILD_SORT.includes(rawSort as ChildSortCol) ? (rawSort as ChildSortCol) : "sortOrder"
  const sortDir  = searchParams.get("sortDir") === "desc" ? "desc" as const : "asc" as const
  const page     = Math.max(1, Number(searchParams.get("page"))    || 1)
  const perPage  = Math.min(100, Number(searchParams.get("perPage")) || 20)

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const where = {
    parentId: id,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(status === "active"   ? { isActive: true  } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
  }

  const [children, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    prisma.category.count({ where }),
  ])

  return NextResponse.json({
    data:      { ...category, children },
    total,
    pageCount: Math.ceil(total / perPage),
    page,
    perPage,
  })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = CategoryUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 })
  }

  const { name, slug, parentId, icon, sortOrder, isActive } = parsed.data

  if (slug) {
    const existing = await prisma.category.findFirst({ where: { slug, id: { not: id } } })
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists." }, { status: 409 })
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name      !== undefined && { name }),
      ...(slug      !== undefined && { slug }),
      ...(icon      !== undefined && { icon: icon || null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive  !== undefined && { isActive }),
      ...(parentId  !== undefined && { parentId: parentId || null }),
    },
  })

  return NextResponse.json({ data: category })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const gigCount = await prisma.gig.count({ where: { categoryId: id } })
  if (gigCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${gigCount} gig${gigCount !== 1 ? "s are" : " is"} assigned to this category.` },
      { status: 409 }
    )
  }

  // Also check children
  const childCount = await prisma.category.count({ where: { parentId: id } })
  if (childCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: this category has ${childCount} subcategor${childCount !== 1 ? "ies" : "y"}. Delete them first.` },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
