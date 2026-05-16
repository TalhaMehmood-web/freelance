import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { createResource } from "@/actions/admin/permissions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function GET() {
  try {
    await requireAuth(UserRole.Admin)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db.permissionResource.findMany({ orderBy: { slug: "asc" } })
  return NextResponse.json({ data: rows })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const result = await createResource(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ data: result.data }, { status: 201 })
}
