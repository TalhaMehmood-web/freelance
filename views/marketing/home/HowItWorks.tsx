import { Search, ShieldCheck, MessageSquare, CheckCircle2 } from "lucide-react"

const BUYER_STEPS = [
  {
    icon: Search,
    title: "Post a job or find a service",
    description:
      "Search our marketplace or post a job brief. Describe what you need and your budget.",
  },
  {
    icon: MessageSquare,
    title: "Connect & discuss details",
    description:
      "Chat directly with freelancers. Review portfolios, compare packages, and ask questions.",
  },
  {
    icon: ShieldCheck,
    title: "Pay securely, work starts",
    description:
      "Funds are held in escrow until you approve delivery. Your money is protected end-to-end.",
  },
  {
    icon: CheckCircle2,
    title: "Approve & release payment",
    description:
      "Review the deliverables, request revisions if needed, then release payment when satisfied.",
  },
]

const SELLER_STEPS = [
  {
    icon: Search,
    title: "Create your profile & gigs",
    description:
      "Showcase your skills, set your packages, and publish your services to millions of buyers.",
  },
  {
    icon: MessageSquare,
    title: "Receive orders & communicate",
    description:
      "Buyers place orders directly or send custom requests. Clarify requirements in our inbox.",
  },
  {
    icon: CheckCircle2,
    title: "Deliver quality work",
    description:
      "Submit work through the platform. Unlimited revisions policy keeps buyers satisfied.",
  },
  {
    icon: ShieldCheck,
    title: "Get paid fast",
    description:
      "Funds clear automatically 14 days after delivery. Withdraw to your bank or PayPal.",
  },
]

function StepList({ steps }: { steps: typeof BUYER_STEPS }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex-shrink-0 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <step.icon className="h-4 w-4 text-brand-500" />
              <h4 className="font-semibold text-text-primary text-sm">{step.title}</h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function HowItWorks() {
  return (
    <section className="bg-surface-subtle border-b border-border py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
            How FreelanceHub works
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Whether you're hiring talent or offering services, we make it simple and secure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <div className="bg-surface rounded-2xl border border-border p-8 shadow-card">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full mb-6">
              For Buyers
            </div>
            <StepList steps={BUYER_STEPS} />
          </div>

          <div className="bg-surface rounded-2xl border border-border p-8 shadow-card">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-success-600 bg-success-100 border border-success-100 px-2.5 py-1 rounded-full mb-6">
              For Sellers
            </div>
            <StepList steps={SELLER_STEPS} />
          </div>
        </div>
      </div>
    </section>
  )
}
