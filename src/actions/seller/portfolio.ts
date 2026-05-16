"use server"

import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import type { ActionResult } from "@/types/shared"
import type { PortfolioItem } from "@/types/portfolio"


const MOCK_ITEMS: PortfolioItem[] = [
  { id: "port_1", title: "FreelanceHub Marketplace",        description: "A full-stack freelance marketplace built with Next.js 16, Prisma, and Supabase.", externalUrl: "https://github.com", categoryId: null, createdAt: "2025-03-10T00:00:00Z" },
  { id: "port_2", title: "SaaS Analytics Dashboard",        description: "Real-time analytics dashboard with TanStack Table, Recharts, and server-side data.", externalUrl: null,                categoryId: null, createdAt: "2025-02-20T00:00:00Z" },
  { id: "port_3", title: "TypeScript REST API Boilerplate", description: "Production-ready Express + TypeScript API with JWT auth, Prisma ORM, and Docker.", externalUrl: "https://github.com", categoryId: null, createdAt: "2025-01-15T00:00:00Z" },
]

export async function getPortfolio(): Promise<ActionResult<PortfolioItem[]>> {
  await requireAuth(UserRole.Seller)
  return { success: true, data: MOCK_ITEMS }
}
