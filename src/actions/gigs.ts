"use server"

import { cache } from "react"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { generateGigSlug } from "@/lib/shared/utils"
import { prisma } from "@/lib/server/prisma"
import { createAdminNotification } from "@/actions/notifications"
import type { ActionResult } from "@/types/shared"
import type { SellerGigRow, GigDetail, GigCard } from "@/types/gigs"
import type {
  GigBasicsData,
  GigPricingData,
  GigDescriptionData,
  GigGalleryData,
} from "@/schemas/client/gigs"
import type { SellerLevel, GigPackageName } from "@/lib/shared/constants"

export interface CreateGigInput {
  basics:      GigBasicsData
  pricing:     GigPricingData
  description: GigDescriptionData
  gallery?:    GigGalleryData
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildImageRows(gallery?: GigGalleryData) {
  if (!gallery) return []
  const rows: { publicUrl: string; storagePath: string; isCover: boolean; sortOrder: number }[] = []
  if (gallery.coverImageUrl) {
    rows.push({ publicUrl: gallery.coverImageUrl, storagePath: gallery.coverImageUrl, isCover: true, sortOrder: 0 })
  }
  gallery.galleryImages.forEach((url, i) => {
    if (url) rows.push({ publicUrl: url, storagePath: url, isCover: false, sortOrder: i + 1 })
  })
  return rows
}

// ─── createGig ───────────────────────────────────────────────────────────────

export async function createGig(
  data: CreateGigInput
): Promise<ActionResult<{ gigId: string; slug: string }>> {
  const session = await requireAuth(UserRole.Seller)
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  const slug = generateGigSlug(data.basics.title)

  const enabledPackages = (["basic", "standard", "premium"] as const).filter(
    k => data.pricing[k].enabled
  )

  const imageRows = buildImageRows(data.gallery)

  const gig = await prisma.gig.create({
    data: {
      sellerProfileId: session.sellerProfileId,
      categoryId:      data.basics.categoryId,
      subcategoryId:   data.basics.subcategoryId ?? null,
      title:           data.basics.title,
      slug,
      description:     data.description.description,
      tags:            data.basics.searchTags,
      faq:             data.description.faqs,
      status:          "active",
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
      ...(imageRows.length > 0 && {
        images: { create: imageRows },
      }),
    },
  })

  await createAdminNotification({
    type:  "approval_request",
    title: "New Gig Published",
    body:  `"${data.basics.title}" was just published and is now live.`,
    data:  { gigId: gig.id, slug: gig.slug },
  }).catch(() => {})

  return { success: true, data: { gigId: gig.id, slug: gig.slug } }
}

// ─── updateGig ───────────────────────────────────────────────────────────────

export async function updateGig(
  gigId: string,
  data: CreateGigInput
): Promise<ActionResult<{ gigId: string }>> {
  const session = await requireAuth(UserRole.Seller)
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  const enabledPackages = (["basic", "standard", "premium"] as const).filter(
    k => data.pricing[k].enabled
  )

  const imageRows = buildImageRows(data.gallery)

  const [, , updatedGig] = await prisma.$transaction([
    prisma.gigPackage.deleteMany({ where: { gigId } }),
    prisma.gigImage.deleteMany({  where: { gigId } }),
    prisma.gig.update({
      where:  { id: gigId, sellerProfileId: session.sellerProfileId },
      select: { slug: true, title: true },
      data: {
        categoryId:    data.basics.categoryId,
        subcategoryId: data.basics.subcategoryId ?? null,
        title:         data.basics.title,
        description:   data.description.description,
        tags:          data.basics.searchTags,
        faq:           data.description.faqs,
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
        ...(imageRows.length > 0 && {
          images: { create: imageRows },
        }),
      },
    }),
  ])

  await createAdminNotification({
    type:  "approval_request",
    title: "Gig Updated",
    body:  `"${updatedGig.title}" was edited by the seller and may need review.`,
    data:  { gigId, slug: updatedGig.slug },
  }).catch(() => {})

  return { success: true, data: { gigId } }
}

// ─── toggleGigStatus ─────────────────────────────────────────────────────────

export async function toggleGigStatus(
  gigId: string,
  status: "active" | "paused"
): Promise<ActionResult<{ gigId: string; status: string }>> {
  const session = await requireAuth(UserRole.Seller)
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
  const session = await requireAuth(UserRole.Seller)
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  await prisma.gig.update({
    where: { id: gigId, sellerProfileId: session.sellerProfileId },
    data:  { status: "suspended" },
  })

  return { success: true, data: null }
}

// ─── getGigById ──────────────────────────────────────────────────────────────
// Returns the gig's data shaped as CreateGigInput so the edit wizard can be
// pre-populated without any additional transformation at the page level.

export async function getGigById(
  gigId: string
): Promise<ActionResult<CreateGigInput & { gigId: string; slug: string }>> {
  const session = await requireAuth(UserRole.Seller)
  if (!session.sellerProfileId) {
    return { success: false, error: "Seller profile not found." }
  }

  const gig = await prisma.gig.findUnique({
    where:   { id: gigId, sellerProfileId: session.sellerProfileId },
    include: {
      packages: { orderBy: { sortOrder: "asc" } },
      images:   { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!gig) return { success: false, error: "Gig not found." }

  const TIER_KEYS = ["basic", "standard", "premium"] as const
  const BLANK_PKG = (enabled: boolean) => ({
    enabled, name: "", description: "", deliveryDays: 7, revisions: 1, priceCents: 0,
  })

  const pricing: GigPricingData = {
    basic:    BLANK_PKG(false),
    standard: BLANK_PKG(false),
    premium:  BLANK_PKG(false),
  }

  gig.packages.forEach((pkg, i) => {
    const key = TIER_KEYS[i] ?? "basic"
    pricing[key] = {
      enabled:      true,
      name:         pkg.name,
      description:  pkg.description ?? "",
      deliveryDays: pkg.deliveryDays,
      revisions:    pkg.revisions,
      priceCents:   pkg.priceCents,
    }
  })

  const faqs = (gig.faq as { question: string; answer: string }[] ?? [])

  return {
    success: true,
    data: {
      gigId: gig.id,
      slug:  gig.slug,
      basics: {
        title:         gig.title,
        categoryId:    gig.categoryId,
        subcategoryId: gig.subcategoryId ?? undefined,
        searchTags:    gig.tags,
      },
      pricing,
      description: {
        description: gig.description,
        faqs,
      },
      gallery: {
        coverImageUrl: gig.images.find(i => i.isCover)?.publicUrl ?? "",
        galleryImages: gig.images.filter(i => !i.isCover).map(i => i.publicUrl),
      },
    },
  }
}

// ─── getGigBySlug ─────────────────────────────────────────────────────────────
// Cached so generateMetadata + page.tsx share a single DB round-trip.

export const getGigBySlug = cache(async (
  slug: string
): Promise<ActionResult<GigDetail>> => {
  const gig = await prisma.gig.findUnique({
    where:   { slug },
    include: {
      packages: {
        where:   { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      images: { orderBy: { sortOrder: "asc" } },
      sellerProfile: {
        include: { profile: true },
      },
      category: true,
    },
  })

  if (!gig || gig.status !== "active") {
    return { success: false, error: "Gig not found." }
  }

  const sp = gig.sellerProfile
  const skills   = (sp.skills as { id: string; name: string }[] | null) ?? []
  const languages = (sp.languages as { language: string; proficiency: string }[] | null) ?? []

  const TIER_NAMES: GigPackageName[] = ["basic", "standard", "premium"]

  const detail: GigDetail = {
    id:                 gig.id,
    slug:               gig.slug,
    title:              gig.title,
    coverImageUrl:      gig.images.find(i => i.isCover)?.publicUrl ?? null,
    startingPriceCents: gig.packages[0]?.priceCents ?? 0,
    avgRating:          gig.avgRating,
    reviewCount:        gig.reviewCount,
    isFeatured:         gig.isFeatured,
    category:           { name: gig.category.name, slug: gig.category.slug },
    description:        gig.description,
    tags:               gig.tags,
    orderCount:         gig.totalOrders,
    inQueue:            0,
    createdAt:          gig.createdAt.toISOString(),
    images: gig.images
      .filter(i => !i.isCover)
      .map((i, idx) => ({ id: i.id, imageUrl: i.publicUrl, sortOrder: idx })),
    faqs: (gig.faq as { question: string; answer: string }[] ?? []).map((f, idx) => ({
      id:       `faq_${idx}`,
      question: f.question,
      answer:   f.answer,
    })),
    packages: gig.packages.map((pkg, i) => ({
      id:          pkg.id,
      packageType: TIER_NAMES[i] ?? "basic",
      name:        pkg.name,
      description: pkg.description ?? "",
      priceCents:  pkg.priceCents,
      deliveryDays: pkg.deliveryDays,
      revisions:   pkg.revisions,
      features:    (pkg.features as string[] | null) ?? [],
    })),
    seller: {
      id:                sp.id,
      userId:            sp.userId,
      username:          sp.profile.username,
      fullName:          sp.profile.fullName,
      avatarUrl:         sp.profilePhotoUrl ?? sp.profile.avatarUrl ?? null,
      professionalTitle: sp.professionalTitle,
      overview:          sp.overview ?? "",
      hourlyRateCents:   null,
      avgRating:         sp.avgRating,
      totalReviews:      sp.totalReviews,
      completedOrders:   sp.completedOrders,
      sellerLevel:       sp.sellerLevel as SellerLevel,
      skills,
      languages,
      availability:      sp.availabilityStatus as "available" | "busy" | "on_vacation",
      responseTimeHours: sp.responseTimeHours,
      memberSinceYear:   sp.createdAt.getFullYear(),
      isVerified:        sp.identityVerified,
      isFeatured:        sp.isFeatured,
      country:           sp.country ?? sp.profile.country ?? null,
    },
  }

  return { success: true, data: detail }
})

// ─── getPublicGigs ────────────────────────────────────────────────────────────
// Used by the public /api/gigs route.

export interface PublicGigsQuery {
  query?:        string
  categoryId?:   string
  subcategoryId?: string
  minPrice?:     number
  maxPrice?:     number
  deliveryDays?: number
  sellerLevel?:  string
  rating?:       number
  sort?:         string
  page?:         number
  perPage?:      number
}

export async function getPublicGigs(
  params: PublicGigsQuery
): Promise<{ data: GigCard[]; total: number; page: number; pageCount: number; perPage: number }> {
  const {
    query, categoryId, subcategoryId, minPrice, maxPrice, deliveryDays, sellerLevel, rating,
    sort = "newest", page = 1, perPage = 12,
  } = params

  type GigWhere = NonNullable<Parameters<typeof prisma.gig.findMany>[0]>["where"]
  const where: GigWhere = {
    status: "active",
    ...(query && { title: { contains: query, mode: "insensitive" } }),
    ...(categoryId && { category: { slug: categoryId } }),
    ...(subcategoryId && { subcategory: { slug: subcategoryId } }),
    ...(rating && { avgRating: { gte: rating } }),
    ...(sellerLevel && { sellerProfile: { sellerLevel: sellerLevel as SellerLevel } }),
    ...((minPrice || maxPrice) && {
      packages: { some: { isActive: true, priceCents: { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) } } },
    }),
    ...(deliveryDays && {
      packages: { some: { isActive: true, deliveryDays: { lte: deliveryDays } } },
    }),
  }

  const isPriceSort = sort === "price_asc" || sort === "price_desc"

  const orderBy = (() => {
    switch (sort) {
      case "orders":  return { totalOrders: "desc" as const }
      case "rating":  return { avgRating:   "desc" as const }
      default:        return { createdAt:   "desc" as const }
    }
  })()

  const [rawGigs, total] = await Promise.all([
    prisma.gig.findMany({
      where,
      include: {
        packages: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
        images:   { orderBy: { sortOrder: "asc" } },
        sellerProfile: { include: { profile: true } },
        category: true,
      },
      // For price sort fetch the full page without DB-level ordering, sort in JS below
      orderBy: isPriceSort ? { createdAt: "desc" } : orderBy,
      skip: isPriceSort ? 0 : (page - 1) * perPage,
      take: isPriceSort ? undefined : perPage,
    }),
    prisma.gig.count({ where }),
  ])

  // Apply price sort + pagination in JS (Prisma has no findMany orderBy on relation scalar)
  const gigs = isPriceSort
    ? rawGigs
        .sort((a, b) => {
          const pa = a.packages[0]?.priceCents ?? 0
          const pb = b.packages[0]?.priceCents ?? 0
          return sort === "price_asc" ? pa - pb : pb - pa
        })
        .slice((page - 1) * perPage, page * perPage)
    : rawGigs

  const data: GigCard[] = gigs.map(g => ({
    id:                 g.id,
    slug:               g.slug,
    title:              g.title,
    coverImageUrl:      g.images.find(i => i.isCover)?.publicUrl ?? g.images[0]?.publicUrl ?? null,
    images:             g.images.map(i => ({ id: i.id, imageUrl: i.publicUrl })),
    startingPriceCents: g.packages[0]?.priceCents ?? 0,
    avgRating:          g.avgRating,
    reviewCount:        g.reviewCount,
    isFeatured:         g.isFeatured,
    category:           { name: g.category.name, slug: g.category.slug },
    seller: {
      username:    g.sellerProfile.profile.username,
      fullName:    g.sellerProfile.profile.fullName,
      avatarUrl:   g.sellerProfile.profilePhotoUrl ?? g.sellerProfile.profile.avatarUrl ?? null,
      sellerLevel: g.sellerProfile.sellerLevel as SellerLevel,
      country:     g.sellerProfile.country ?? g.sellerProfile.profile.country ?? null,
    },
  }))

  return { data, total, page, pageCount: Math.max(1, Math.ceil(total / perPage)), perPage }
}

// ─── getSellerGigs ───────────────────────────────────────────────────────────

export async function getSellerGigs(): Promise<ActionResult<SellerGigRow[]>> {
  const session = await requireAuth(UserRole.Seller)
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
