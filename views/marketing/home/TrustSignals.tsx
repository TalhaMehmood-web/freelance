import { ShieldCheck, Lock, Clock, Award, RefreshCw, Headphones } from "lucide-react"

const SIGNALS = [
  {
    icon: ShieldCheck,
    title: "Secure escrow payments",
    description:
      "Funds are held safely until you approve the delivery. We never release payment prematurely.",
  },
  {
    icon: Award,
    title: "Verified talent",
    description:
      "Every seller undergoes identity verification and skills assessment before joining the platform.",
  },
  {
    icon: RefreshCw,
    title: "Satisfaction guarantee",
    description:
      "Request unlimited revisions within the agreed scope. If you're not satisfied, we'll make it right.",
  },
  {
    icon: Lock,
    title: "Enterprise-grade security",
    description:
      "SOC 2 Type II compliant. All data encrypted at rest and in transit. GDPR and CCPA ready.",
  },
  {
    icon: Clock,
    title: "On-time delivery tracking",
    description:
      "Every order has a deadline. Our smart alerts keep freelancers accountable and clients informed.",
  },
  {
    icon: Headphones,
    title: "24/7 dedicated support",
    description:
      "Our support team resolves disputes and answers questions around the clock, every day.",
  },
]

export function TrustSignals() {
  return (
    <section className="bg-surface-subtle border-b border-border py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
            Built for business confidence
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            From solo entrepreneurs to Fortune 500 procurement teams, FreelanceHub keeps every
            transaction protected.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SIGNALS.map((s) => (
            <div
              key={s.title}
              className="flex gap-4 bg-surface rounded-xl border border-border p-6 shadow-card"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm mb-1">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
