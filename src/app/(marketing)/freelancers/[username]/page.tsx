import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FreelancerProfileView } from "@/views/marketing/freelancers/FreelancerProfileView/index"
import { UsernameSchema } from "@/schemas/server/freelancers"
import type { FreelancerProfile } from "@/types/freelancer"

const PLACEHOLDER_PROFILE: FreelancerProfile = {
  id:                "sp_alexdev",
  userId:            "usr_alexdev",
  username:          "alexdev",
  fullName:          "Alex Martinez",
  avatarUrl:         null,
  professionalTitle: "Full-Stack Developer · React · Node.js · TypeScript",
  overview:
    "I'm a full-stack engineer with 7+ years of experience building scalable SaaS products. I specialize in React, Next.js, TypeScript, and Node.js backends. I've shipped products used by 100k+ users and worked with startups from seed to Series B.\n\nI take pride in clean code, clear communication, and delivering on time. If you have a complex project that needs a reliable engineer who can own the technical architecture end-to-end, let's talk.",
  hourlyRateCents:   12500,
  avgRating:         4.97,
  totalReviews:      214,
  completedOrders:   312,
  sellerLevel:       "top_rated",
  skills:            [
    { id: "sk_react",      name: "React" },
    { id: "sk_nextjs",     name: "Next.js" },
    { id: "sk_typescript", name: "TypeScript" },
    { id: "sk_nodejs",     name: "Node.js" },
    { id: "sk_postgresql", name: "PostgreSQL" },
    { id: "sk_graphql",    name: "GraphQL" },
    { id: "sk_aws",        name: "AWS" },
    { id: "sk_docker",     name: "Docker" },
  ],
  languages:         [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Conversational" },
  ],
  availability:      "available",
  responseTimeHours: 2,
  memberSinceYear:   2019,
  isVerified:        true,
  isFeatured:        true,
  country:           "United States",
  portfolio:         [
    {
      id:           "pi_1",
      title:        "SaaS Analytics Dashboard",
      description:  "Built a real-time analytics platform for a fintech startup. React + D3.js frontend, Node.js event stream backend.",
      imageUrl:     null,
      projectUrl:   null,
      completedAt:  "2024-03-15T00:00:00.000Z",
    },
    {
      id:           "pi_2",
      title:        "E-Commerce Platform Rebuild",
      description:  "Migrated a legacy PHP store to Next.js + Prisma + Stripe. 60% reduction in load time.",
      imageUrl:     null,
      projectUrl:   null,
      completedAt:  "2023-11-20T00:00:00.000Z",
    },
    {
      id:           "pi_3",
      title:        "Real-time Collaboration Tool",
      description:  "Multiplayer whiteboard app using Supabase Realtime and tldraw. Used by 10k+ users.",
      imageUrl:     null,
      projectUrl:   null,
      completedAt:  "2023-07-10T00:00:00.000Z",
    },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  if (!UsernameSchema.safeParse(username).success) return { title: "Not Found | FreelanceHub" }

  const profile = PLACEHOLDER_PROFILE
  return {
    title:       `${profile.fullName} — Freelancer | FreelanceHub`,
    description: profile.overview.slice(0, 160),
    openGraph: {
      title:       profile.fullName,
      description: profile.overview.slice(0, 160),
      type:        "profile",
      url:         `/freelancers/${profile.username}`,
    },
    twitter: { card: "summary", title: profile.fullName },
    alternates: { canonical: `/freelancers/${profile.username}` },
  }
}

export default async function FreelancerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  if (!UsernameSchema.safeParse(username).success) notFound()

  const profile: FreelancerProfile | null =
    username === PLACEHOLDER_PROFILE.username ? PLACEHOLDER_PROFILE : null

  if (!profile) notFound()

  return <FreelancerProfileView profile={profile} />
}
