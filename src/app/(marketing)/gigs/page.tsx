import type { Metadata } from "next"
import { GigsView } from "@/views/marketing/gigs/GigsView/index"
import { GigSearchParamsSchema } from "@/schemas/server/gigs"
import { getCategories } from "@/actions/categories"

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

  const categories = await getCategories()

  return (
    <GigsView
      initialFilters={{
        q:            safeParams.q,
        category:     safeParams.category,
        subcategory:  safeParams.subcategory,
        minPrice:     safeParams.minPrice,
        maxPrice:     safeParams.maxPrice,
        deliveryDays: safeParams.deliveryDays,
        sellerLevel:  safeParams.sellerLevel,
        minRating:    safeParams.minRating,
        sort:         safeParams.sort,
      }}
      categories={categories}
    />
  )
}
