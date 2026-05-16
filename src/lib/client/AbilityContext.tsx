"use client"

import { createContext, useContext, useMemo } from "react"
import { createMongoAbility, type RawRuleOf } from "@casl/ability"
import type { AppAbility } from "@/lib/shared/ability"

const AbilityContext = createContext<AppAbility>(createMongoAbility())

export function useAbility(): AppAbility {
  return useContext(AbilityContext)
}

export function AbilityProvider({
  rules,
  children,
}: {
  rules: RawRuleOf<AppAbility>[]
  children: React.ReactNode
}) {
  const ability = useMemo(() => createMongoAbility<AppAbility>(rules), [rules])
  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}
