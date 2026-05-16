"use client"

import { useState } from "react"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import type { Query } from "@tanstack/react-query"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"

const CACHE_KEY = "freelance-permissions-cache"

// Created once at module level so the persister reference is stable
const persister = createSyncStoragePersister({
  key:     CACHE_KEY,
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
})

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            30_000,
        retry:                1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient)

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge:           60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query: Query) =>
            Array.isArray(query.queryKey) && query.queryKey[0] === "user-permissions",
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
