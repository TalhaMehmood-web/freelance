import type { Metadata } from "next"
import { GigsView } from "@/views/marketing/gigs/GigsView/index"
import { GigSearchParamsSchema } from "@/schemas/server/gigs"
import type { GigCard } from "@/types/gigs"

const STATIC_CATEGORIES = [
  { name: "Development & IT",     slug: "development-it"     },
  { name: "Design & Creative",    slug: "design-creative"    },
  { name: "Video & Animation",    slug: "video-animation"    },
  { name: "Writing & Translation",slug: "writing-translation"},
  { name: "Digital Marketing",    slug: "digital-marketing"  },
  { name: "Data & Analytics",     slug: "data-analytics"     },
  { name: "Music & Audio",        slug: "music-audio"        },
  { name: "Business",             slug: "business"           },
  { name: "AI Services",          slug: "ai-services"        },
]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}): Promise<Metadata> {
  const raw = await searchParams
  const parsed = GigSearchParamsSchema.safeParse(raw)
  const q = parsed.success ? parsed.data.q : ""
  const title = q ? `"${q}" — Freelance Services` : "Browse Freelance Services"

  return {
    title,
    description:
      "Find top freelancers for development, design, marketing, writing and more. Secure payments, vetted talent, delivered fast.",
    alternates: { canonical: "/gigs" },
  }
}

export default async function GigsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const raw = await searchParams
  const parsed = GigSearchParamsSchema.safeParse(raw)
  const safeParams = parsed.success
    ? parsed.data
    : GigSearchParamsSchema.parse({})

  // TODO Phase 2 backend: replace with real DB query using safeParams
  const gigs: GigCard[] = []
  const total = 0

  return (
    <GigsView
      gigs={gigs}
      total={total}
      filters={{
        q:            safeParams.q,
        category:     safeParams.category,
        minPrice:     safeParams.minPrice,
        maxPrice:     safeParams.maxPrice,
        deliveryDays: safeParams.deliveryDays,
        sellerLevel:  safeParams.sellerLevel,
        minRating:    safeParams.minRating,
        sort:         safeParams.sort,
      }}
      categories={STATIC_CATEGORIES}
    />
  )
}
