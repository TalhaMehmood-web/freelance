import Link from "next/link"
import { Search, ArrowRight, Star, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const TRENDING = [
  "Logo Design",
  "WordPress",
  "Video Editing",
  "Architecture",
  "Social Media",
  "SEO",
  "Illustration",
]

const STATS = [
  { value: "1M+", label: "Freelancers" },
  { value: "500K+", label: "Businesses" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "$2B+", label: "Paid Out" },
]

export function HeroSection() {
  return (
    <section className="relative bg-surface border-b border-border overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-brand-500) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Enterprise-grade freelance platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight mb-6">
            Find the perfect{" "}
            <span className="text-brand-500">freelance services</span>{" "}
            for your business
          </h1>

          <p className="text-xl text-text-secondary leading-relaxed mb-8 max-w-xl">
            Work with talented freelancers at the most affordable prices. Quality work,
            delivered fast. Trusted by 500,000+ businesses worldwide.
          </p>

          {/* Search */}
          <div className="flex gap-3 mb-6 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              <input
                type="search"
                placeholder="Try 'logo design' or 'website development'"
                className="w-full h-12 pl-11 pr-4 text-base bg-surface border border-border rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all"
              />
            </div>
            <Button size="lg" className="h-12 px-6 rounded-xl gap-2" render={<Link href="/gigs" />}>
              Search
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Trending */}
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-text-tertiary font-medium">Popular:</span>
            {TRENDING.map((term) => (
              <Link
                key={term}
                href={`/gigs?q=${encodeURIComponent(term)}`}
                className="text-text-secondary hover:text-brand-500 hover:underline transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="text-3xl font-bold text-text-primary">{stat.value}</span>
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex items-center gap-6 text-sm text-text-tertiary">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-success-500" />
            <span>Secure payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-accent-500" />
            <span>Verified freelancers</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-brand-500" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  )
}
