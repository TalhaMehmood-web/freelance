import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { generateGigSlug } from "@/lib/shared/utils"
import { prisma } from "@/lib/server/prisma"
import { createAdminNotification } from "@/lib/server/notifications"
import { z } from "zod"
import type {
  GigBasicsData,
  GigPricingData,
  GigDescriptionData,
  GigGalleryData,
} from "@/schemas/client/gigs"
import type { SellerGigRow } from "@/types/gigs"

const QuerySchema = z.object({
  status:  z.enum(["", "active", "paused", "draft"]).optional().default(""),
  sort:    z.enum(["newest", "oldest", "orders", "impressions", "price_asc", "price_desc"]).optional().default("newest"),
  search:  z.string().max(200).optional().default(""),
  page:    z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(50).optional().default(10),
})

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

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response
  const { session } = auth
  if (!session.sellerProfileId) {
    return NextResponse.json({ error: "Seller profile not found." }, { status: 400 })
  }

  const sp     = req.nextUrl.searchParams
  const parsed = QuerySchema.safeParse({
    status:  sp.get("status")  ?? "",
    sort:    sp.get("sort")    ?? "newest",
    search:  sp.get("search")  ?? "",
    page:    sp.get("page")    ?? "1",
    perPage: sp.get("perPage") ?? "10",
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const { status, sort, search, page, perPage } = parsed.data

  const gigs = await prisma.gig.findMany({
    where: {
      sellerProfileId: session.sellerProfileId,
      status:          { not: "suspended" },
    },
    include: {
      packages: { where: { isActive: true }, orderBy: { priceCents: "asc" } },
      images:   { where: { isCover: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  let rows: SellerGigRow[] = gigs.map(g => ({
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

  if (status) rows = rows.filter(g => g.status === status)
  if (search) {
    const q = search.toLowerCase()
    rows = rows.filter(g => g.title.toLowerCase().includes(q))
  }

  rows.sort((a, b) => {
    switch (sort) {
      case "oldest":      return a.createdAt.localeCompare(b.createdAt)
      case "orders":      return b.stats.orders      - a.stats.orders
      case "impressions": return b.stats.impressions - a.stats.impressions
      case "price_asc":   return a.packages.startingPriceCents - b.packages.startingPriceCents
      case "price_desc":  return b.packages.startingPriceCents - a.packages.startingPriceCents
      default:            return b.createdAt.localeCompare(a.createdAt)
    }
  })

  const total     = rows.length
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const data      = rows.slice((page - 1) * perPage, page * perPage)

  return NextResponse.json({ data, total, page, pageCount, perPage })
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response
  const { session } = auth
  if (!session.sellerProfileId) {
    return NextResponse.json({ error: "Seller profile not found." }, { status: 400 })
  }

  const body: { basics: GigBasicsData; pricing: GigPricingData; description: GigDescriptionData; gallery?: GigGalleryData } = await req.json()

  const slug = generateGigSlug(body.basics.title)
  const enabledPackages = (["basic", "standard", "premium"] as const).filter(k => body.pricing[k].enabled)
  const imageRows = buildImageRows(body.gallery)

  const gig = await prisma.gig.create({
    data: {
      sellerProfileId: session.sellerProfileId,
      categoryId:      body.basics.categoryId,
      subcategoryId:   body.basics.subcategoryId ?? null,
      title:           body.basics.title,
      slug,
      description:     body.description.description,
      tags:            body.basics.searchTags,
      faq:             body.description.faqs,
      status:          "active",
      packages: {
        create: enabledPackages.map((k, i) => ({
          name:         body.pricing[k].name,
          description:  body.pricing[k].description,
          priceCents:   body.pricing[k].priceCents,
          deliveryDays: body.pricing[k].deliveryDays,
          revisions:    body.pricing[k].revisions,
          sortOrder:    i,
        })),
      },
      ...(imageRows.length > 0 && { images: { create: imageRows } }),
    },
  })

  await createAdminNotification({
    type:  "approval_request",
    title: "New Gig Published",
    body:  `"${body.basics.title}" was just published and is now live.`,
    data:  { gigId: gig.id, slug: gig.slug },
  }).catch(() => {})

  return NextResponse.json({ success: true, data: { gigId: gig.id, slug: gig.slug } }, { status: 201 })
}
