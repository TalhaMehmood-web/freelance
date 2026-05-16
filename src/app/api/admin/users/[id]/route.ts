import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const profile = await prisma.profile.findUnique({
    where:   { userId: id },
    include: {
      sellerProfile: {
        include: {
          gigs: {
            where:   { status: { not: "suspended" } },
            include: {
              packages: { where: { isActive: true }, orderBy: { priceCents: "asc" } },
              images:   { where: { isCover: true }, take: 1 },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  const sp   = profile.sellerProfile
  const gigs = sp?.gigs ?? []

  const gigRows = gigs.map(g => ({
    id:            g.id,
    slug:          g.slug,
    title:         g.title,
    status:        g.status,
    coverImageUrl: g.images[0]?.publicUrl ?? null,
    packages: {
      startingPriceCents: g.packages[0]?.priceCents ?? 0,
      packageCount:       g.packages.length,
    },
    stats: {
      impressions:  0,
      clicks:       0,
      orders:       g.totalOrders,
      avgRating:    g.avgRating,
      reviewCount:  g.reviewCount,
    },
    createdAt: g.createdAt.toISOString(),
  }))

  const activeGigs = gigRows.filter(g => g.status === "active").length

  return NextResponse.json({
    profile: {
      id:        profile.id,
      userId:    profile.userId,
      username:  profile.username,
      fullName:  profile.fullName,
      avatarUrl: profile.avatarUrl ?? null,
      email:     "",
      roles:     profile.roles,
      country:   profile.country ?? null,
      createdAt: profile.createdAt.toISOString(),
      bio:       profile.bio ?? null,
      isBlocked: profile.isBlocked,
      blockedAt: profile.blockedAt ? profile.blockedAt.toISOString() : null,
    },
    sellerProfile: sp ? {
      id:               sp.id,
      displayName:      sp.displayName,
      professionalTitle: sp.professionalTitle,
      sellerLevel:      sp.sellerLevel,
      avgRating:        sp.avgRating,
      totalReviews:     sp.totalReviews,
      completedOrders:  sp.completedOrders,
      isFeatured:       sp.isFeatured,
      identityVerified: sp.identityVerified,
    } : null,
    gigs: gigRows,
    stats: {
      gigCount:     gigRows.length,
      activeGigs,
      totalOrders:  sp?.completedOrders ?? 0,
      avgRating:    sp?.avgRating ?? 0,
    },
  })
}
