import type { Metadata } from "next"
import { HomeView } from "@/views/marketing/home/HomeView"
import type { GigCard } from "@/lib/shared/types"

export const metadata: Metadata = {
  title: "FreelanceHub — Find Expert Freelancers for Your Business",
  description:
    "Work with talented freelancers across development, design, marketing, writing, and more. Quality work delivered fast. Trusted by 500,000+ businesses worldwide.",
  openGraph: {
    title: "FreelanceHub — Find Expert Freelancers for Your Business",
    description:
      "Work with talented freelancers across development, design, marketing, writing, and more. Quality work delivered fast.",
    type: "website",
    url: "https://freelancehub.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelanceHub — Expert Freelancers for Every Business",
    description: "Hire top freelancers for any project. Secure payments, verified talent, 24/7 support.",
  },
  alternates: {
    canonical: "/",
  },
}

// Static shell — no DB needed for the homepage to load
const PLACEHOLDER_GIGS: GigCard[] = []

export default function HomePage() {
  return <HomeView featuredGigs={PLACEHOLDER_GIGS} />
}
