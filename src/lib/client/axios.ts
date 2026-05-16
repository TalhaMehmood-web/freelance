"use client"

import axios from "axios"
import { createSupabaseBrowserClient } from "@/lib/client/supabase"

export const apiClient = axios.create()

// Attach Supabase access token to every request as Bearer
apiClient.interceptors.request.use(async (config) => {
  const supabase = createSupabaseBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// On 401 — clear persisted cache and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear localStorage permission cache key
      const cacheKey = "freelance-permissions-cache"
      localStorage.removeItem(cacheKey)
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)
