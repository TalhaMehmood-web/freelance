import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { FreelancerProfileView } from "@/views/marketing/freelancers/FreelancerProfileView/index"
import { UsernameSchema } from "@/schemas/server/freelancers"
import { getFreelancerByUsername } from "@/actions/freelancers"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  if (!UsernameSchema.safeParse(username).success) return { title: "Not Found | FreelanceHub" }

  const profile = await getFreelancerByUsername(username)
  if (!profile) return { title: "Freelancer Not Found | FreelanceHub" }

  return {
    title:       `${profile.fullName} — Freelancer | FreelanceHub`,
    description: profile.overview.slice(0, 160),
    openGraph: {
      title:       profile.fullName,
      description: profile.overview.slice(0, 160),
      images:      profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
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

  const profile = await getFreelancerByUsername(username)
  if (!profile) notFound()

  return <FreelancerProfileView profile={profile} />
}
