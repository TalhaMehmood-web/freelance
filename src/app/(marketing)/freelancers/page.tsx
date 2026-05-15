import type { Metadata } from "next"
import { FreelancersView } from "@/views/marketing/freelancers/FreelancersView/index"
import { FreelancerSearchParamsSchema } from "@/schemas/server/freelancers"
import type { SellerProfilePublic } from "@/types/freelancer"

const STATIC_CATEGORIES = [
  { name: "Development & IT",      slug: "development-it"     },
  { name: "Design & Creative",     slug: "design-creative"    },
  { name: "Video & Animation",     slug: "video-animation"    },
  { name: "Writing & Translation", slug: "writing-translation"},
  { name: "Digital Marketing",     slug: "digital-marketing"  },
  { name: "Data & Analytics",      slug: "data-analytics"     },
  { name: "Music & Audio",         slug: "music-audio"        },
  { name: "Business",              slug: "business"           },
  { name: "AI Services",           slug: "ai-services"        },
]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}): Promise<Metadata> {
  const raw = await searchParams
  const parsed = FreelancerSearchParamsSchema.safeParse(raw)
  const q = parsed.success ? parsed.data.q : ""
  const title = q ? `"${q}" — Freelancers` : "Find Freelancers"

  return {
    title,
    description:
      "Hire top-rated freelancers for any project. Browse verified talent by skill, level, and availability.",
    alternates: { canonical: "/freelancers" },
  }
}

export default async function FreelancersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const raw = await searchParams
  const parsed = FreelancerSearchParamsSchema.safeParse(raw)
  const safeParams = parsed.success
    ? parsed.data
    : FreelancerSearchParamsSchema.parse({})

  // TODO Phase 2 backend: replace with real DB query using safeParams
  const freelancers: SellerProfilePublic[] = []
  const total = 0

  return (
    <FreelancersView
      freelancers={freelancers}
      total={total}
      filters={{
        q:             safeParams.q,
        category:      safeParams.category,
        sellerLevel:   safeParams.sellerLevel,
        minRating:     safeParams.minRating,
        minHourlyRate: safeParams.minHourlyRate,
        maxHourlyRate: safeParams.maxHourlyRate,
        availability:  safeParams.availability,
        sort:          safeParams.sort,
      }}
      categories={STATIC_CATEGORIES}
    />
  )
}
