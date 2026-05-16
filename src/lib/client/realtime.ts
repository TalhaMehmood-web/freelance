"use client"

import { createSupabaseBrowserClient, createAuthenticatedRealtimeClient } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

type TableEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface SubscribeToTableOptions<T extends Record<string, unknown>> {
  table:   string
  event?:  TableEvent
  filter?: string
  onData:  (payload: T) => void
}

export async function subscribeToTable<T extends Record<string, unknown>>({
  table,
  event = "*",
  filter,
  onData,
}: SubscribeToTableOptions<T>): Promise<RealtimeChannel> {
  // Get the user's JWT first
  const anonClient   = createSupabaseBrowserClient()
  const sessionResult = await anonClient.auth.getSession()
  const token        = sessionResult.data?.session?.access_token

  // Use an authenticated client so the WS handshake itself carries the JWT
  const supabase  = token ? createAuthenticatedRealtimeClient(token) : anonClient
  const channelName = `table:${table}:${filter ?? "all"}`

  console.log(`[Realtime] subscribing "${channelName}" authenticated=${!!token}`)

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      (payload: { new: unknown; errors?: string[] }) => {
        if (payload.errors?.length) {
          console.error(`[Realtime] ❌ row error "${channelName}":`, payload.errors)
          return
        }
        console.log(`[Realtime] ✅ received "${channelName}"`, payload.new)
        onData(payload.new as T)
      }
    )
    .subscribe((status: string, err?: Error) => {
      if (err) console.error(`[Realtime] ❌ "${channelName}":`, status, err)
      else     console.log(`[Realtime] status "${channelName}":`, status)
    })

  return channel
}

export function unsubscribeChannel(channel: RealtimeChannel) {
  // removeChannel works on any client instance
  const supabase = createSupabaseBrowserClient()
  supabase.removeChannel(channel)
}
