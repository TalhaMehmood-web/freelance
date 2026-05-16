"use server"

import { cache } from "react"
import { prisma } from "@/lib/server/prisma"
import type { SellerLevel, AvailabilityStatus } from "@/lib/shared/constants"
import type {
  FreelancerProfile,
  PortfolioItemPublic,
  FreelancerGig,
  FreelancerReview,
  FreelancerEducation,
  FreelancerCertification,
} from "@/types/freelancer"

export const getFreelancerByUsername = cache(async (username: string): Promise<FreelancerProfile | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = await (prisma.profile.findUnique as any)({
    where: { username },
    select: {
      userId: true,
      username: true,
      fullName: true,
      avatarUrl: true,
      sellerProfile: {
        select: {
          id: true,
          userId: true,
          professionalTitle: true,
          overview: true,
          profilePhotoUrl: true,
          languages: true,
          skills: true,
          education: true,
          certifications: true,
          availabilityStatus: true,
          sellerLevel: true,
          identityVerified: true,
          isFeatured: true,
          avgRating: true,
          totalReviews: true,
          completedOrders: true,
          responseTimeHours: true,
          country: true,
          createdAt: true,
          portfolioItems: {
            where: { isVisible: true },
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              media: true,
              externalUrl: true,
              createdAt: true,
            },
          },
          gigs: {
            where: { status: "active" },
            orderBy: { totalOrders: "desc" },
            take: 8,
            select: {
              id: true,
              slug: true,
              title: true,
              avgRating: true,
              reviewCount: true,
              totalOrders: true,
              images: {
                where: { isCover: true },
                take: 1,
                select: { publicUrl: true },
              },
              packages: {
                where: { isActive: true },
                orderBy: { priceCents: "asc" },
                take: 1,
                select: { priceCents: true },
              },
            },
          },
        },
      },
    },
  })

  if (!profile?.sellerProfile) return null

  const sp = profile.sellerProfile

  const skills = (sp.skills as { id: string; name: string }[] | null) ?? []
  const languages = (sp.languages as { language: string; proficiency: string }[] | null) ?? []
  const education = (sp.education as FreelancerEducation[] | null) ?? []
  const certifications = (sp.certifications as FreelancerCertification[] | null) ?? []

  const portfolio: PortfolioItemPublic[] = sp.portfolioItems.map((item: {
    id: string; title: string; description: string | null
    media: unknown; externalUrl: string | null; createdAt: Date
  }) => {
    const mediaArr = (item.media as { url?: string }[] | null) ?? []
    return {
      id:          item.id,
      title:       item.title,
      description: item.description,
      imageUrl:    mediaArr[0]?.url ?? null,
      projectUrl:  item.externalUrl,
      completedAt: item.createdAt.toISOString(),
    }
  })

  const gigs: FreelancerGig[] = sp.gigs.map((g: {
    id: string; slug: string; title: string; avgRating: number
    reviewCount: number; totalOrders: number
    images: { publicUrl: string }[]
    packages: { priceCents: number }[]
  }) => ({
    id:                 g.id,
    slug:               g.slug,
    title:              g.title,
    coverImageUrl:      g.images[0]?.publicUrl ?? null,
    startingPriceCents: g.packages[0]?.priceCents ?? 0,
    avgRating:          g.avgRating,
    reviewCount:        g.reviewCount,
    totalOrders:        g.totalOrders,
  }))

  // Fetch visible reviews for this seller
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawReviews = await (prisma.review.findMany as any)({
    where: {
      revieweeId: profile.userId,
      isVisible:  true,
      isHidden:   false,
    },
    orderBy: { createdAt: "desc" },
    take:    10,
    select: {
      id:                  true,
      rating:              true,
      communicationRating: true,
      qualityRating:       true,
      deliveryRating:      true,
      comment:             true,
      createdAt:           true,
      reviewer: {
        select: { fullName: true, avatarUrl: true },
      },
    },
  })

  const reviews: FreelancerReview[] = rawReviews.map((r: {
    id: string; rating: number; communicationRating: number
    qualityRating: number; deliveryRating: number; comment: string | null
    createdAt: Date; reviewer: { fullName: string; avatarUrl: string | null }
  }) => ({
    id:                  r.id,
    reviewerName:        r.reviewer.fullName,
    reviewerAvatarUrl:   r.reviewer.avatarUrl,
    rating:              r.rating,
    communicationRating: r.communicationRating,
    qualityRating:       r.qualityRating,
    deliveryRating:      r.deliveryRating,
    comment:             r.comment,
    createdAt:           r.createdAt.toISOString(),
  }))

  return {
    id:                sp.id,
    userId:            sp.userId,
    username:          profile.username,
    fullName:          profile.fullName,
    avatarUrl:         sp.profilePhotoUrl ?? profile.avatarUrl ?? null,
    professionalTitle: sp.professionalTitle,
    overview:          sp.overview ?? "",
    hourlyRateCents:   null,
    avgRating:         sp.avgRating,
    totalReviews:      sp.totalReviews,
    completedOrders:   sp.completedOrders,
    sellerLevel:       sp.sellerLevel as SellerLevel,
    skills,
    languages,
    availability:      sp.availabilityStatus as AvailabilityStatus,
    responseTimeHours: sp.responseTimeHours,
    memberSinceYear:   sp.createdAt.getFullYear(),
    isVerified:        sp.identityVerified,
    isFeatured:        sp.isFeatured,
    country:           sp.country,
    portfolio,
    gigs,
    reviews,
    education,
    certifications,
  }
})
