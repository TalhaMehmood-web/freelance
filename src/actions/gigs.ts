"use server"

import { requireAuth } from "@/lib/server/auth"
import { generateGigSlug } from "@/lib/shared/utils"
import { prisma } from "@/lib/server/prisma"
import type { ActionResult } from "@/types/shared"
import type { SellerGigRow } from "@/types/gigs"
import type {
  GigBasicsData,
  GigPricingData,
  GigDescriptionData,
  GigGalleryData,
} from "@/schemas/client/gigs"

export interface CreateGigInput {
  basics:      GigBasicsData
  pricing:     GigPricingData
  description: GigDescriptionData
  gallery?:    GigGalleryData
}

// ─── createGig ───────────────────────────────────────────────────────────────

export async function createGig(
  data: CreateGigInput
): Promise<ActionResult<{ gigId: string; slug: string }>> {
  const session = await requireAuth("seller")
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  const slug = generateGigSlug(data.basics.title)

  const enabledPackages = (["basic", "standard", "premium"] as const).filter(
    k => data.pricing[k].enabled
  )

  const gig = await prisma.gig.create({
    data: {
      sellerProfileId: session.sellerProfileId,
      categoryId:      data.basics.categoryId,
      title:           data.basics.title,
      slug,
      description:     data.description.description,
      tags:            data.basics.searchTags,
      faq:             data.description.faqs,
      status:          "draft",
      packages: {
        create: enabledPackages.map((k, i) => ({
          name:         data.pricing[k].name,
          description:  data.pricing[k].description,
          priceCents:   data.pricing[k].priceCents,
          deliveryDays: data.pricing[k].deliveryDays,
          revisions:    data.pricing[k].revisions,
          sortOrder:    i,
        })),
      },
    },
  })

  return { success: true, data: { gigId: gig.id, slug: gig.slug } }
}

// ─── updateGig ───────────────────────────────────────────────────────────────

export async function updateGig(
  gigId: string,
  data: CreateGigInput
): Promise<ActionResult<{ gigId: string }>> {
  const session = await requireAuth("seller")
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  const enabledPackages = (["basic", "standard", "premium"] as const).filter(
    k => data.pricing[k].enabled
  )

  await prisma.$transaction([
    prisma.gigPackage.deleteMany({ where: { gigId } }),
    prisma.gig.update({
      where: { id: gigId, sellerProfileId: session.sellerProfileId },
      data: {
        categoryId:  data.basics.categoryId,
        title:       data.basics.title,
        description: data.description.description,
        tags:        data.basics.searchTags,
        faq:         data.description.faqs,
        packages: {
          create: enabledPackages.map((k, i) => ({
            name:         data.pricing[k].name,
            description:  data.pricing[k].description,
            priceCents:   data.pricing[k].priceCents,
            deliveryDays: data.pricing[k].deliveryDays,
            revisions:    data.pricing[k].revisions,
            sortOrder:    i,
          })),
        },
      },
    }),
  ])

  return { success: true, data: { gigId } }
}

// ─── toggleGigStatus ─────────────────────────────────────────────────────────

export async function toggleGigStatus(
  gigId: string,
  status: "active" | "paused"
): Promise<ActionResult<{ gigId: string; status: string }>> {
  const session = await requireAuth("seller")
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  await prisma.gig.update({
    where: { id: gigId, sellerProfileId: session.sellerProfileId },
    data:  { status },
  })

  return { success: true, data: { gigId, status } }
}

// ─── deleteGig ───────────────────────────────────────────────────────────────
// Soft-delete: status → "suspended" (never shown to buyers or seller)

export async function deleteGig(gigId: string): Promise<ActionResult<null>> {
  const session = await requireAuth("seller")
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  await prisma.gig.update({
    where: { id: gigId, sellerProfileId: session.sellerProfileId },
    data:  { status: "suspended" },
  })

  return { success: true, data: null }
}

// ─── getSellerGigs ───────────────────────────────────────────────────────────

export async function getSellerGigs(): Promise<ActionResult<SellerGigRow[]>> {
  const session = await requireAuth("seller")
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  const gigs = await prisma.gig.findMany({
    where: {
      sellerProfileId: session.sellerProfileId,
      status: { not: "suspended" },
    },
    include: {
      packages: { where: { isActive: true }, orderBy: { priceCents: "asc" } },
      images:   { where: { isCover: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  const rows: SellerGigRow[] = gigs.map(g => ({
    id:            g.id,
    slug:          g.slug,
    title:         g.title,
    status:        g.status as SellerGigRow["status"],
    coverImageUrl: g.images[0]?.publicUrl ?? null,
    packages: {
      startingPriceCents: g.packages[0]?.priceCents ?? 0,
      packageCount:       g.packages.length,
    },
    stats: {
      impressions: 0,
      clicks:      0,
      orders:      g.totalOrders,
      avgRating:   g.avgRating,
      reviewCount: g.reviewCount,
    },
    createdAt: g.createdAt.toISOString(),
  }))

  return { success: true, data: rows }
}
