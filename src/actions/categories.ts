"use server"

import { cache } from "react"
import { prisma } from "@/lib/server/prisma"
import type { Category } from "@prisma/client"

export type CategoryWithChildren = Category & { children: Category[] }

export const getCategories = cache(async (): Promise<CategoryWithChildren[]> => {
  const cats = await prisma.category.findMany({
    where:   { parentId: null, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  })
  return cats
})
