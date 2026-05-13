import type { Metadata } from "next"
import { requireAuth } from "@/lib/server/auth"
import { ProjectsView } from "@/views/buyer/ProjectsView"

export const metadata: Metadata = { title: "My Projects | FreelanceHub" }

export default async function ProjectsPage() {
  await requireAuth()
  return <ProjectsView />
}
