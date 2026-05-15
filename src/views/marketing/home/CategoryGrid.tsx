import Link from "next/link"
import {
  Code2, Palette, Video, PenLine, BarChart2, Globe, Music,
  Camera, BookOpen, Megaphone, Building2, Cpu,
} from "lucide-react"

const CATEGORIES = [
  { name: "Development & IT", icon: Code2, slug: "development-it", count: "89k+" },
  { name: "Design & Creative", icon: Palette, slug: "design-creative", count: "71k+" },
  { name: "Video & Animation", icon: Video, slug: "video-animation", count: "43k+" },
  { name: "Writing & Translation", icon: PenLine, slug: "writing-translation", count: "62k+" },
  { name: "Data & Analytics", icon: BarChart2, slug: "data-analytics", count: "28k+" },
  { name: "Digital Marketing", icon: Megaphone, slug: "digital-marketing", count: "54k+" },
  { name: "Music & Audio", icon: Music, slug: "music-audio", count: "31k+" },
  { name: "Photography", icon: Camera, slug: "photography", count: "19k+" },
  { name: "Business", icon: Building2, slug: "business", count: "47k+" },
  { name: "AI Services", icon: Cpu, slug: "ai-services", count: "22k+" },
  { name: "Translation", icon: Globe, slug: "translation", count: "35k+" },
  { name: "Online Tutoring", icon: BookOpen, slug: "online-tutoring", count: "14k+" },
]

export function CategoryGrid() {
  return (
    <section className="bg-surface-subtle border-b border-border py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            Browse by category
          </h2>
          <p className="text-text-secondary">
            Explore services across every major discipline
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/gigs?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 bg-surface rounded-xl border border-border p-5 text-center hover:border-brand-300 hover:shadow-card transition-all duration-200"
            >
              <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <cat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary leading-tight mb-0.5">
                  {cat.name}
                </p>
                <p className="text-xs text-text-tertiary">{cat.count} services</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
