import { NextRequest, NextResponse } from "next/server"
import { requireApiAuth } from "@/lib/server/apiAuth"
import { UserRole } from "@/lib/shared/constants"
import { prisma } from "@/lib/server/prisma"

const VALID_SORT = ["fullName", "username", "createdAt", "lastSignInAt"] as const
type SortCol = typeof VALID_SORT[number]

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req, UserRole.Admin)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get("search")?.trim() ?? ""
  const role     = searchParams.get("role") ?? ""
  const status   = searchParams.get("status") ?? ""  // "active" | "blocked" | ""
  const rawSort  = searchParams.get("sortBy") ?? "createdAt"
  const sortBy: SortCol = VALID_SORT.includes(rawSort as SortCol) ? (rawSort as SortCol) : "createdAt"
  const sortDir  = searchParams.get("sortDir") === "asc" ? "asc" as const : "desc" as const
  const page     = Math.max(1, Number(searchParams.get("page"))    || 1)
  const perPage  = Math.min(100, Number(searchParams.get("perPage")) || 20)

  const offset = (page - 1) * perPage

  type RawRow = {
    user_id:      string
    id:           string
    username:     string
    full_name:    string
    avatar_url:   string | null
    roles:        string[]
    country:      string | null
    created_at:   Date
    is_blocked:   boolean
    blocked_at:   Date | null
    seller_id:    string | null
    seller_level: string | null
    gig_count:    bigint
  }

  // Build WHERE clauses for raw SQL
  const conditions: string[] = []
  const bindings:   unknown[] = []
  let   idx = 1

  if (search) {
    conditions.push(`(p.full_name ILIKE $${idx} OR p.username ILIKE $${idx})`)
    bindings.push(`%${search}%`)
    idx++
  }
  if (role) {
    conditions.push(`$${idx} = ANY(p.roles)`)
    bindings.push(role)
    idx++
  }
  if (status === "blocked") { conditions.push(`p.is_blocked = true`) }
  if (status === "active")  { conditions.push(`p.is_blocked = false`) }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  // lastSignInAt requires auth schema access (not available via pooler) — omit for now
  const sortMap: Record<SortCol, string> = {
    fullName:     "p.full_name",
    username:     "p.username",
    createdAt:    "p.created_at",
    lastSignInAt: "p.created_at",
  }
  const orderClause = `ORDER BY ${sortMap[sortBy]} ${sortDir.toUpperCase()} NULLS LAST`

  const [rows, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<RawRow[]>(`
      SELECT
        p.user_id,
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.roles,
        p.country,
        p.created_at,
        p.is_blocked,
        p.blocked_at,
        sp.id          AS seller_id,
        sp.seller_level,
        COALESCE(gc.cnt, 0) AS gig_count
      FROM profiles p
      LEFT JOIN seller_profiles sp ON sp.user_id = p.user_id
      LEFT JOIN (
        SELECT seller_profile_id, COUNT(*) AS cnt
        FROM gigs
        WHERE status != 'suspended'
        GROUP BY seller_profile_id
      ) gc ON gc.seller_profile_id = sp.id
      ${whereClause}
      ${orderClause}
      LIMIT ${perPage} OFFSET ${offset}
    `, ...bindings),
    prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*) FROM profiles p ${whereClause}
    `, ...bindings),
  ])

  const total = Number(countResult[0]?.count ?? 0)

  const data = rows.map(r => ({
    id:              r.id,
    userId:          r.user_id,
    username:        r.username,
    fullName:        r.full_name,
    avatarUrl:       r.avatar_url ?? null,
    email:           "",
    roles:           r.roles,
    country:         r.country ?? null,
    createdAt:       r.created_at.toISOString(),
    isBlocked:       r.is_blocked,
    blockedAt:       r.blocked_at ? r.blocked_at.toISOString() : null,
    lastSignInAt:    null,
    sellerLevel:     r.seller_level ?? null,
    gigCount:        Number(r.gig_count),
    sellerProfileId: r.seller_id ?? null,
  }))

  return NextResponse.json({ data, total, pageCount: Math.max(1, Math.ceil(total / perPage)), page, perPage })
}
