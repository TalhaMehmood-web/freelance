import { HeroSection } from "./HeroSection"
import { CategoryGrid } from "./CategoryGrid"
import { FeaturedGigs } from "./FeaturedGigs"
import { HowItWorks } from "./HowItWorks"
import { StatsSection } from "./StatsSection"
import { Testimonials } from "./Testimonials"
import { TrustSignals } from "./TrustSignals"
import type { GigCard } from "@/lib/shared/types"

interface HomeViewProps {
  featuredGigs: GigCard[]
}

export function HomeView({ featuredGigs }: HomeViewProps) {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedGigs gigs={featuredGigs} />
      <HowItWorks />
      <StatsSection />
      <Testimonials />
      <TrustSignals />
    </>
  )
}
