import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GigDetailView } from "@/views/marketing/gigs/GigDetailView/index"
import { GigSlugSchema } from "@/schemas/server/gigs"
import { getGigBySlug } from "@/actions/gigs"
import { formatCurrency } from "@/lib/shared/utils"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!GigSlugSchema.safeParse(slug).success) {
    return { title: "Service Not Found | FreelanceHub" }
  }

  const result = await getGigBySlug(slug)
  if (!result.success || !result.data) {
    return { title: "Service Not Found | FreelanceHub" }
  }

  const gig         = result.data
  const description = gig.description.replace(/<[^>]*>/g, "").slice(0, 160)
  const title       = `${gig.title} | FreelanceHub`
  const url         = `/gigs/${gig.slug}`
  const images      = gig.coverImageUrl
    ? [{ url: gig.coverImageUrl, width: 1200, height: 630, alt: gig.title }]
    : []

  return {
    title,
    description,
    keywords: [...gig.tags, gig.category.name, gig.seller.fullName, "freelance", "hire"].join(", "),
    authors:  [{ name: gig.seller.fullName }],
    openGraph: {
      title,
      description,
      type:      "website",
      url,
      images,
      siteName:  "FreelanceHub",
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      gig.coverImageUrl ? [gig.coverImageUrl] : [],
    },
    alternates: { canonical: url },
    other: {
      "product:price:amount":   String(gig.startingPriceCents / 100),
      "product:price:currency": "USD",
      "og:price:amount":        String(gig.startingPriceCents / 100),
    },
  }
}

export default async function GigDetailPage({ params }: Props) {
  const { slug } = await params

  if (!GigSlugSchema.safeParse(slug).success) notFound()

  const result = await getGigBySlug(slug)
  if (!result.success || !result.data) notFound()

  return <GigDetailView gig={result.data} />
}
