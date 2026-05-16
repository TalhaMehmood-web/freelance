import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { UserOverviewView } from "@/views/admin/UserDashboard/UserOverviewView"

export const metadata: Metadata = { title: "User Overview | FreelanceHub" }

export default async function UserOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth(UserRole.Admin)
  const { id } = await params

  const profile = await prisma.profile.findUnique({
    where:   { userId: id },
    include: {
      sellerProfile: {
        include: {
          gigs: { where: { status: { not: "suspended" } }, select: { id: true, status: true } },
        },
      },
    },
  })

  if (!profile) notFound()

  const sp         = profile.sellerProfile
  const gigs       = sp?.gigs ?? []
  const activeGigs = gigs.filter(g => g.status === "active").length

  return (
    <UserOverviewView
      profile={{
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
      }}
      sellerProfile={sp ? {
        id:                sp.id,
        displayName:       sp.displayName,
        professionalTitle: sp.professionalTitle,
        sellerLevel:       sp.sellerLevel,
        avgRating:         sp.avgRating,
        totalReviews:      sp.totalReviews,
        completedOrders:   sp.completedOrders,
        isFeatured:        sp.isFeatured,
        identityVerified:  sp.identityVerified,
      } : null}
      stats={{
        gigCount:    gigs.length,
        activeGigs,
        totalOrders: sp?.completedOrders ?? 0,
        avgRating:   sp?.avgRating ?? 0,
      }}
    />
  )
}
