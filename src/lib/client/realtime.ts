"use client"

import { createSupabaseBrowserClient } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

type TableEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

interface SubscribeToTableOptions<T extends Record<string, unknown>> {
  table: string
  event?: TableEvent
  filter?: string
  onData: (payload: T) => void
}

export function subscribeToTable<T extends Record<string, unknown>>({
  table,
  event = "*",
  filter,
  onData,
}: SubscribeToTableOptions<T>): RealtimeChannel {
  const supabase = createSupabaseBrowserClient()

  const channel = supabase
    .channel(`table:${table}:${filter ?? "all"}`)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      (payload: { new: unknown }) => {
        onData(payload.new as T)
      }
    )
    .subscribe()

  return channel
}

export function unsubscribeChannel(channel: RealtimeChannel) {
  const supabase = createSupabaseBrowserClient()
  supabase.removeChannel(channel)
}
