import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { generateGigSlug } from "@/lib/shared/utils"
import { createAdminNotification } from "@/lib/server/notifications"
import type {
  GigBasicsData,
  GigPricingData,
  GigDescriptionData,
  GigGalleryData,
} from "@/schemas/client/gigs"

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

// PUT /api/seller/gigs/[gigId] — update gig
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response
  const { session } = auth
  if (!session.sellerProfileId) {
    return NextResponse.json({ error: "Seller profile not found." }, { status: 400 })
  }

  const { gigId } = await params
  const body: { basics: GigBasicsData; pricing: GigPricingData; description: GigDescriptionData; gallery?: GigGalleryData } = await req.json()

  const enabledPackages = (["basic", "standard", "premium"] as const).filter(k => body.pricing[k].enabled)
  const imageRows = buildImageRows(body.gallery)

  const [, , updatedGig] = await prisma.$transaction([
    prisma.gigPackage.deleteMany({ where: { gigId } }),
    prisma.gigImage.deleteMany({   where: { gigId } }),
    prisma.gig.update({
      where:  { id: gigId, sellerProfileId: session.sellerProfileId },
      select: { slug: true, title: true },
      data: {
        categoryId:    body.basics.categoryId,
        subcategoryId: body.basics.subcategoryId ?? null,
        title:         body.basics.title,
        description:   body.description.description,
        tags:          body.basics.searchTags,
        faq:           body.description.faqs,
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
    }),
  ])

  await createAdminNotification({
    type:  "approval_request",
    title: "Gig Updated",
    body:  `"${updatedGig.title}" was edited by the seller and may need review.`,
    data:  { gigId, slug: updatedGig.slug },
  }).catch(() => {})

  return NextResponse.json({ success: true, data: { gigId } })
}

// PATCH /api/seller/gigs/[gigId] — toggle status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response
  const { session } = auth
  if (!session.sellerProfileId) {
    return NextResponse.json({ error: "Seller profile not found." }, { status: 400 })
  }

  const { gigId } = await params
  const { status } = await req.json() as { status: "active" | "paused" }

  if (status !== "active" && status !== "paused") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 })
  }

  await prisma.gig.update({
    where: { id: gigId, sellerProfileId: session.sellerProfileId },
    data:  { status },
  })

  return NextResponse.json({ success: true, data: { gigId, status } })
}

// DELETE /api/seller/gigs/[gigId] — soft delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ gigId: string }> }
) {
  const auth = await requireApiAuth(req, UserRole.Seller)
  if (!auth.ok) return auth.response
  const { session } = auth
  if (!session.sellerProfileId) {
    return NextResponse.json({ error: "Seller profile not found." }, { status: 400 })
  }

  const { gigId } = await params

  await prisma.gig.update({
    where: { id: gigId, sellerProfileId: session.sellerProfileId },
    data:  { status: "suspended" },
  })

  return NextResponse.json({ success: true })
}
