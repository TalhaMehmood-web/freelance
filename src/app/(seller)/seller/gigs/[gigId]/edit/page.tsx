import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { GigEditView } from "@/views/seller/GigEditView"
import { getGigById } from "@/actions/gigs"
import { getCategories } from "@/actions/categories"

export const metadata: Metadata = {
  title: "Edit Gig | FreelanceHub",
}

interface PageProps {
  params: Promise<{ gigId: string }>
}

export default async function GigEditPage({ params }: PageProps) {
  await requireAuth(UserRole.Seller)
  const { gigId } = await params

  const [gigResult, categories] = await Promise.all([
    getGigById(gigId),
    getCategories(),
  ])

  if (!gigResult.success || !gigResult.data) notFound()

  const { gigId: id, slug: _slug, basics, pricing, description, gallery } = gigResult.data

  return (
    <GigEditView
      gigId={id}
      initialBasics={basics}
      initialPricing={pricing}
      initialDescription={description}
      initialGallery={gallery ?? { coverImageUrl: "", galleryImages: [] }}
      categories={categories}
    />
  )
}
