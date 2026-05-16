import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

// Lazily-initialized so module evaluation at build time doesn't require DATABASE_URL
let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalThis.__prisma ?? createPrismaClient()
    if (process.env.NODE_ENV !== "production") {
      globalThis.__prisma = _prisma
    }
  }
  return _prisma
}

// Convenience re-export — most callers use this
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as PrismaClient)[prop as keyof PrismaClient]
  },
})
