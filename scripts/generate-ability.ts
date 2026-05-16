import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { writeFileSync } from "fs"
import { resolve } from "path"
import * as dotenv from "dotenv"

dotenv.config({ path: resolve(".env") })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db   = prisma as any
  const perms = await db.permission.findMany({
    select: { resource: true, action: true },
  })

  const subjects = [...new Set<string>(perms.map((p: { resource: string }) => p.resource))].sort()
  const actions  = [...new Set<string>(perms.map((p: { action: string }) => p.action))].sort()

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const lines = [
    `// AUTO-GENERATED — run \`npm run gen:ability\` to refresh. Do not edit manually.`,
    ``,
    `export const Subject = {`,
    ...subjects.map(s => `  ${cap(s)}: "${cap(s)}",`),
    `} as const`,
    ``,
    `export type Subject = (typeof Subject)[keyof typeof Subject]`,
    ``,
    `export const Action = {`,
    ...actions.map(a => `  ${cap(a)}: "${a}",`),
    `} as const`,
    ``,
    `export type Action = (typeof Action)[keyof typeof Action]`,
  ]

  const outPath = resolve("src/lib/shared/ability.generated.ts")
  writeFileSync(outPath, lines.join("\n") + "\n")
  console.log(`✓ Generated ${subjects.length} subject(s): [${subjects.map(cap).join(", ")}]`)
  console.log(`✓ Generated ${actions.length} action(s):  [${actions.map(cap).join(", ")}]`)
  console.log(`→ ${outPath}`)
}

main().finally(() => prisma.$disconnect())
