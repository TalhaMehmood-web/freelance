import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { GigCard } from "@/components/gigs/GigCard"
import type { GigCard as GigCardType } from "@/lib/shared/types"

interface FeaturedGigsProps {
  gigs: GigCardType[]
}

export function FeaturedGigs({ gigs }: FeaturedGigsProps) {
  if (gigs.length === 0) return null

  return (
    <section className="bg-surface py-16 border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
              Featured services
            </h2>
            <p className="text-text-secondary">
              Hand-picked top quality work across all categories
            </p>
          </div>
          <Link
            href="/gigs"
            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Browse all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/gigs"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Browse all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
