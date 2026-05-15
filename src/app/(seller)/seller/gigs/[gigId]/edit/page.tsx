import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { GigEditView } from "@/views/seller/GigEditView"
import type { GigBasicsData, GigPricingData, GigDescriptionData, GigGalleryData } from "@/schemas/client/gigs"

export const metadata: Metadata = {
  title: "Edit Gig | FreelanceHub",
}

interface PageProps {
  params: Promise<{ gigId: string }>
}

export default async function GigEditPage({ params }: PageProps) {
  await requireAuth("seller")
  const { gigId } = await params

  // MOCK Phase 2 — replace with getGigById(gigId) + shape transformation in Phase 3
  const initialBasics: GigBasicsData = {
    title:         "I will build a production-ready Next.js SaaS application",
    categoryId:    "cat_dev",
    subcategoryId: undefined,
    searchTags:    ["nextjs", "react", "typescript"],
  }

  const initialPricing: GigPricingData = {
    basic: {
      enabled:      true,
      name:         "Starter",
      description:  "Core setup with responsive design and basic features",
      deliveryDays: 7,
      revisions:    2,
      priceCents:   49900,
    },
    standard: {
      enabled:      true,
      name:         "Professional",
      description:  "Full-featured app with authentication and database integration",
      deliveryDays: 14,
      revisions:    5,
      priceCents:   99900,
    },
    premium: {
      enabled:      false,
      name:         "",
      description:  "",
      deliveryDays: 30,
      revisions:    99,
      priceCents:   0,
    },
  }

  const initialDescription: GigDescriptionData = {
    description:
      "I am a full-stack developer with 5+ years of experience building production Next.js applications. " +
      "I specialize in modern React patterns, TypeScript, and scalable architecture. " +
      "Every project I deliver is fully tested, well-documented, and optimized for performance. " +
      "Let me help you build the SaaS product you've been dreaming about.",
    faqs: [],
  }

  const initialGallery: GigGalleryData = {
    coverImageUrl: "",
    galleryImages: [],
  }

  return (
    <GigEditView
      gigId={gigId}
      initialBasics={initialBasics}
      initialPricing={initialPricing}
      initialDescription={initialDescription}
      initialGallery={initialGallery}
    />
  )
}
