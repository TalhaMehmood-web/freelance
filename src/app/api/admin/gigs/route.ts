import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

const VALID_SORT = ["title", "createdAt", "totalOrders", "avgRating"] as const
type SortCol = typeof VALID_SORT[number]

const VALID_STATUS = ["active", "paused", "draft", "suspended"] as const
type GigStatus = typeof VALID_STATUS[number]

export async function GET(req: NextRequest) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get("search")?.trim() ?? ""
  const rawStatus = searchParams.get("status") ?? ""
  const status: GigStatus | "" = VALID_STATUS.includes(rawStatus as GigStatus) ? (rawStatus as GigStatus) : ""
  const rawSort  = searchParams.get("sortBy") ?? "createdAt"
  const sortBy: SortCol = VALID_SORT.includes(rawSort as SortCol) ? (rawSort as SortCol) : "createdAt"
  const sortDir  = searchParams.get("sortDir") === "asc" ? "asc" as const : "desc" as const
  const page     = Math.max(1, Number(searchParams.get("page"))    || 1)
  const perPage  = Math.min(100, Number(searchParams.get("perPage")) || 20)

  type Where = NonNullable<Parameters<typeof prisma.gig.findMany>[0]>["where"]
  const where: Where = {
    ...(search && { title: { contains: search, mode: "insensitive" } }),
    ...(status ? { status } : { status: { not: "suspended" } }),
  }

  const [gigs, total] = await Promise.all([
    prisma.gig.findMany({
      where,
      include: {
        packages: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
        images:   { where: { isCover: true }, take: 1 },
        sellerProfile: { include: { profile: { select: { username: true, fullName: true, avatarUrl: true } } } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { [sortBy]: sortDir },
      skip:    (page - 1) * perPage,
      take:    perPage,
    }),
    prisma.gig.count({ where }),
  ])

  const data = gigs.map(g => ({
    id:                 g.id,
    slug:               g.slug,
    title:              g.title,
    status:             g.status,
    coverImageUrl:      g.images[0]?.publicUrl ?? null,
    startingPriceCents: g.packages[0]?.priceCents ?? 0,
    totalOrders:        g.totalOrders,
    avgRating:          g.avgRating,
    reviewCount:        g.reviewCount,
    isFeatured:         g.isFeatured,
    createdAt:          g.createdAt.toISOString(),
    category:           { name: g.category.name, slug: g.category.slug },
    seller: {
      username: g.sellerProfile.profile.username,
      fullName: g.sellerProfile.profile.fullName,
      avatarUrl: g.sellerProfile.profilePhotoUrl ?? g.sellerProfile.profile.avatarUrl ?? null,
      userId:   g.sellerProfile.userId,
    },
  }))

  return NextResponse.json({ data, total, pageCount: Math.max(1, Math.ceil(total / perPage)), page, perPage })
}
