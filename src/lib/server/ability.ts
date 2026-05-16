import { prisma } from "@/lib/server/prisma"
import { buildAbility, type AppAbility } from "@/lib/shared/ability"
import type { Session } from "@/types/shared"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export async function getAbilityForSession(session: Session): Promise<AppAbility> {
  if (session.isSuperAdmin) return buildAbility([], true)

  const [roles, overrides] = await Promise.all([
    db.role.findMany({
      where:  { slug: { in: session.grantedRoles } },
      select: { permissions: true },
    }),
    db.userPermissionOverride.findMany({
      where: { userId: session.userId },
    }),
  ])

  const roleKeys: string[]     = roles.flatMap((r: { permissions: string[] }) => r.permissions)
  const granted:  string[]     = overrides.filter((o: { granted: boolean }) => o.granted).map((o: { permission: string }) => o.permission)
  const denied:   string[]     = overrides.filter((o: { granted: boolean }) => !o.granted).map((o: { permission: string }) => o.permission)
  const effective: string[]    = [...new Set([...roleKeys, ...granted])].filter(k => !denied.includes(k))

  return buildAbility(effective, false)
}
