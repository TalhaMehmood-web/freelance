"use server"

import { requireAuth } from "@/lib/server/auth"
import type { ActionResult } from "@/types/shared"

export interface PortfolioItem {
  id:          string
  title:       string
  description: string | null
  externalUrl: string | null
  categoryId:  string | null
  createdAt:   string
}

export interface AddPortfolioInput {
  title:       string
  description?: string
  externalUrl?: string
  categoryId?:  string
}

// MOCK Phase 2
const MOCK_ITEMS: PortfolioItem[] = [
  { id: "port_1", title: "FreelanceHub Marketplace",   description: "A full-stack freelance marketplace built with Next.js 16, Prisma, and Supabase.", externalUrl: "https://github.com", categoryId: null, createdAt: "2025-03-10T00:00:00Z" },
  { id: "port_2", title: "SaaS Analytics Dashboard",   description: "Real-time analytics dashboard with TanStack Table, Recharts, and server-side data.", externalUrl: null,                categoryId: null, createdAt: "2025-02-20T00:00:00Z" },
  { id: "port_3", title: "TypeScript REST API Boilerplate", description: "Production-ready Express + TypeScript API with JWT auth, Prisma ORM, and Docker.", externalUrl: "https://github.com", categoryId: null, createdAt: "2025-01-15T00:00:00Z" },
]

export async function getPortfolio(): Promise<ActionResult<PortfolioItem[]>> {
  await requireAuth("seller")
  return { success: true, data: MOCK_ITEMS }
}

// MOCK Phase 2 — replace with prisma.portfolioItem.create
export async function addPortfolioItem(input: AddPortfolioInput): Promise<ActionResult<PortfolioItem>> {
  await requireAuth("seller")
  const newItem: PortfolioItem = {
    id:          `port_${Date.now()}`,
    title:       input.title,
    description: input.description ?? null,
    externalUrl: input.externalUrl ?? null,
    categoryId:  input.categoryId ?? null,
    createdAt:   new Date().toISOString(),
  }
  return { success: true, data: newItem }
}

// MOCK Phase 2 — replace with prisma.portfolioItem.delete
export async function deletePortfolioItem(itemId: string): Promise<ActionResult<null>> {
  await requireAuth("seller")
  return { success: true, data: null }
}
