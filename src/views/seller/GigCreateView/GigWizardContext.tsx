"use client"

import { createContext, useContext } from "react"
import type { CategoryWithChildren } from "@/types/categories"

interface GigWizardContextValue {
  categories: CategoryWithChildren[]
}

const GigWizardContext = createContext<GigWizardContextValue>({ categories: [] })

export function GigWizardProvider({
  categories,
  children,
}: {
  categories: CategoryWithChildren[]
  children: React.ReactNode
}) {
  return (
    <GigWizardContext.Provider value={{ categories }}>
      {children}
    </GigWizardContext.Provider>
  )
}

export function useGigWizard() {
  return useContext(GigWizardContext)
}
