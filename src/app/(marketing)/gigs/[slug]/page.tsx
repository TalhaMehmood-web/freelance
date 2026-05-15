import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GigDetailView } from "@/views/marketing/gigs/GigDetailView/index"
import { GigSlugSchema } from "@/schemas/server/gigs"
import type { GigDetail } from "@/types/gigs"

// ─── Placeholder — replace with DB fetch in Phase 2 backend ──────────────────

const PLACEHOLDER_GIG: GigDetail = {
  id: "gig_placeholder_001",
  slug: "full-stack-react-nextjs-web-application-xk7p2",
  title: "I will build a full-stack React / Next.js web application",
  coverImageUrl: null,
  startingPriceCents: 29900,
  avgRating: 4.9,
  reviewCount: 143,
  isFeatured: true,
  category: { name: "Development & IT", slug: "development-it" },
  description: `I specialise in building modern, production-ready web applications using React and Next.js.\n\nWhat you'll get:\n• Fully responsive, pixel-perfect UI\n• Clean, well-documented TypeScript code\n• Deployed to Vercel or your preferred platform\n• 30 days post-delivery support\n\nI have 6+ years of commercial experience delivering projects for startups and enterprises. Every delivery includes a handover session.`,
  tags: ["react", "nextjs", "typescript", "full-stack", "web-app"],
  orderCount: 312,
  inQueue: 2,
  createdAt: "2024-01-10T09:00:00.000Z",
  images: [],
  faqs: [
    {
      id: "faq_001",
      question: "What information do you need to start?",
      answer:
        "A brief description of your project, any design references or wireframes you have, and your preferred tech stack if you have one in mind.",
    },
    {
      id: "faq_002",
      question: "Do you offer revisions after delivery?",
      answer:
        "Yes — all packages include at least one revision. Premium includes unlimited revisions within the scope of the original brief.",
    },
    {
      id: "faq_003",
      question: "Can you work with an existing codebase?",
      answer:
        "Absolutely. I am comfortable joining an existing project. Please share a repository link when placing the order.",
    },
  ],
  packages: [
    {
      id: "pkg_basic",
      packageType: "basic",
      name: "Starter",
      description: "Simple landing page or marketing site, up to 5 pages.",
      priceCents: 29900,
      deliveryDays: 7,
      revisions: 2,
      features: [
        "Responsive design",
        "Next.js App Router",
        "TypeScript",
        "Contact form",
      ],
    },
    {
      id: "pkg_standard",
      packageType: "standard",
      name: "Professional",
      description: "Full multi-page application with authentication and database.",
      priceCents: 79900,
      deliveryDays: 14,
      revisions: 5,
      features: [
        "Responsive design",
        "Next.js App Router",
        "TypeScript",
        "Contact form",
        "Authentication",
        "Database integration",
      ],
    },
    {
      id: "pkg_premium",
      packageType: "premium",
      name: "Enterprise",
      description: "Complex application with admin dashboard, API, and deployment.",
      priceCents: 199900,
      deliveryDays: 30,
      revisions: 99,
      features: [
        "Responsive design",
        "Next.js App Router",
        "TypeScript",
        "Contact form",
        "Authentication",
        "Database integration",
        "Admin dashboard",
        "REST API",
        "CI/CD + deployment",
      ],
    },
  ],
  seller: {
    id: "seller_placeholder_001",
    userId: "user_placeholder_001",
    username: "alexdev",
    fullName: "Alex Johnson",
    avatarUrl: null,
    professionalTitle: "Full-Stack Engineer — React, Next.js, Node",
    overview: "6+ years building production web apps for startups and enterprises.",
    hourlyRateCents: 9500,
    avgRating: 4.9,
    totalReviews: 143,
    completedOrders: 312,
    sellerLevel: "top_rated",
    skills: [
      { id: "s1", name: "React" },
      { id: "s2", name: "Next.js" },
      { id: "s3", name: "TypeScript" },
      { id: "s4", name: "Node.js" },
      { id: "s5", name: "PostgreSQL" },
      { id: "s6", name: "Tailwind CSS" },
    ],
    languages: [
      { language: "English", proficiency: "Native" },
      { language: "Spanish", proficiency: "Conversational" },
    ],
    availability: "available",
    responseTimeHours: 2,
    memberSinceYear: 2019,
    isVerified: true,
    isFeatured: true,
    country: "United States",
  },
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!GigSlugSchema.safeParse(slug).success) {
    return { title: "Service Not Found | FreelanceHub" }
  }

  // TODO Phase 2 backend: fetch real gig for metadata
  const gig = PLACEHOLDER_GIG

  return {
    title: `${gig.title} | FreelanceHub`,
    description: gig.description.slice(0, 160),
    openGraph: {
      title: gig.title,
      description: gig.description.slice(0, 160),
      type: "website",
      images: gig.coverImageUrl
        ? [{ url: gig.coverImageUrl, width: 1200, height: 630 }]
        : [],
      url: `/gigs/${gig.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: gig.title,
      description: gig.description.slice(0, 160),
    },
    alternates: { canonical: `/gigs/${gig.slug}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!GigSlugSchema.safeParse(slug).success) notFound()

  // TODO Phase 2 backend: const gig = await getGigBySlug(slug)
  const gig: GigDetail | null =
    slug === PLACEHOLDER_GIG.slug ? PLACEHOLDER_GIG : null

  if (!gig) notFound()

  return <GigDetailView gig={gig} />
}
