import { type NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { requireSuperAdmin } from "@/lib/server/permissions"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"
import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const rows = await db.permissionResource.findMany({ orderBy: { slug: "asc" } })
  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const parsed = z.object({
    slug:  z.string().min(1).max(60).trim().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores only"),
    label: z.string().min(1).max(80).trim(),
  }).safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { slug, label } = parsed.data
  const existing = await db.permissionResource.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: `Resource "${slug}" already exists.` }, { status: 400 })

  const row = await db.permissionResource.create({ data: { slug, label } })
  return NextResponse.json({ data: { id: row.id, slug: row.slug, label: row.label } }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response
  const { session } = auth

  try { await requireSuperAdmin(session) }
  catch { return NextResponse.json({ error: "Super admin required." }, { status: 403 }) }

  const { count } = await db.permissionResource.deleteMany({})
  return NextResponse.json({ success: true, deleted: count })
}
