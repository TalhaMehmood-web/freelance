import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { TeamView } from "@/views/buyer/TeamView"

export const metadata: Metadata = { title: "Team | FreelanceHub" }

export default async function TeamPage() {
  await requireAuth()
  return <TeamView />
}
