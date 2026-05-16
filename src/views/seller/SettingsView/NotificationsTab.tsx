"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/client/axios"
import type { SellerSettingsData } from "@/types/seller"

const Schema = z.object({
  newOrder:    z.boolean(),
  messages:    z.boolean(),
  reviews:     z.boolean(),
  promotional: z.boolean(),
})
type FormData = z.infer<typeof Schema>

const NOTIFICATION_ITEMS = [
  { name: "newOrder" as const,    label: "New Orders",         description: "Get notified when a buyer places an order with you" },
  { name: "messages" as const,    label: "Messages",           description: "Get notified when you receive a new message" },
  { name: "reviews" as const,     label: "Reviews",            description: "Get notified when a buyer leaves a review" },
  { name: "promotional" as const, label: "Promotional Emails", description: "Tips, offers, and platform announcements" },
]

export function NotificationsTab({ defaults }: { defaults: SellerSettingsData }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved]             = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: defaults.notifications,
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => apiClient.patch("/api/seller/settings/notifications", data),
    onSuccess: () => setSaved(true),
    onError:   () => setServerError("Failed to save."),
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    setSaved(false)
    saveMutation.mutate(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="bg-surface-subtle rounded-2xl border border-border divide-y divide-border">
        {NOTIFICATION_ITEMS.map(item => (
          <div key={item.name} className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
            </div>
            <Controller
              control={form.control}
              name={item.name}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        ))}
      </div>

      {serverError && <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-3 py-2">{serverError}</p>}
      {saved && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">Notification preferences saved.</p>}

      <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : "Save Changes"}</Button>
    </form>
  )
}
