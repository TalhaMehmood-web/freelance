"use client"

import { createBrowserClient } from "@supabase/ssr"

let _anonClient: ReturnType<typeof createBrowserClient> | null = null

// Standard anon client — used for auth session management and API calls
export function createSupabaseBrowserClient() {
  if (!_anonClient) {
    _anonClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _anonClient
}

// Authenticated realtime client — created with user's JWT so the WS handshake
// is authenticated from the start. A new client per token is required because
// the singleton anon client cannot swap credentials mid-connection reliably.
export function createAuthenticatedRealtimeClient(accessToken: string) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      realtime: {
        params: { apikey: accessToken },
      },
    },
  )
}
