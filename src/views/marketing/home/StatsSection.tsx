import { TrendingUp, Users2, Briefcase, Globe2 } from "lucide-react"

const METRICS = [
  { icon: Users2, value: "1M+", label: "Active freelancers", sub: "across 190 countries" },
  { icon: Briefcase, value: "500K+", label: "Businesses served", sub: "from startups to Fortune 500" },
  { icon: TrendingUp, value: "$2B+", label: "Paid to freelancers", sub: "and growing every day" },
  { icon: Globe2, value: "190+", label: "Countries represented", sub: "truly global talent pool" },
]

export function StatsSection() {
  return (
    <section className="relative py-14 overflow-hidden bg-brand-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-100/60 via-brand-50 to-white pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            The platform by the numbers
          </h2>
          <p className="text-text-secondary">Scale, quality, and trust — all in one place.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="bg-surface rounded-2xl border border-brand-100 px-6 py-7 text-center shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-500 flex items-center justify-center mx-auto mb-4">
                <m.icon className="h-5 w-5" />
              </div>
              <p className="text-4xl font-extrabold text-brand-500 mb-1">{m.value}</p>
              <p className="text-sm font-semibold text-text-primary mb-0.5">{m.label}</p>
              <p className="text-xs text-text-tertiary">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
