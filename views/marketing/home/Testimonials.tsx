import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/shared/utils"

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Head of Product",
    company: "NovaTech Inc.",
    avatar: null,
    rating: 5,
    body:
      "We've sourced 12 long-term contractors through FreelanceHub over the past year. The quality of talent is consistently excellent and the escrow system gives our finance team peace of mind.",
  },
  {
    name: "James Okafor",
    role: "Founder",
    company: "Launchpad Digital",
    avatar: null,
    rating: 5,
    body:
      "As a solo founder, I've built my entire engineering team here. The approval workflow feature has been invaluable — I can delegate hiring decisions without losing oversight.",
  },
  {
    name: "Priya Sharma",
    role: "Creative Director",
    company: "Axis Media Group",
    avatar: null,
    rating: 5,
    body:
      "We run a high-volume content operation. FreelanceHub's organisation workspace and spend analytics save us hours of tracking work every month.",
  },
  {
    name: "Marcus Chen",
    role: "Senior Full-Stack Developer",
    company: "Freelancer",
    avatar: null,
    rating: 5,
    body:
      "I left my agency job two years ago and now earn three times my old salary exclusively through FreelanceHub. The seller analytics dashboard is the best I've seen on any platform.",
  },
  {
    name: "Elena Kowalski",
    role: "Brand Designer",
    company: "Freelancer",
    avatar: null,
    rating: 5,
    body:
      "The milestone projects feature changed everything for me. Clients appreciate the structured approach and I get paid progressively, which massively improved my cash flow.",
  },
  {
    name: "David Park",
    role: "VP Engineering",
    company: "Streamline SaaS",
    avatar: null,
    rating: 5,
    body:
      "Our enterprise contract went live in 48 hours. The dedicated account manager guided us through SSO setup and the custom approval rules are exactly what our procurement team required.",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="bg-surface py-16 border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
            Trusted by teams worldwide
          </h2>
          <p className="text-text-secondary">
            See why 500,000+ businesses and 1 million+ freelancers choose FreelanceHub.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="bg-surface-subtle rounded-xl border border-border p-6 flex flex-col gap-4"
            >
              <Stars count={t.rating} />
              <blockquote className="flex-1 text-sm text-text-secondary leading-relaxed">
                &ldquo;{t.body}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-border">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                    {getInitials(t.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {t.role} · {t.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
