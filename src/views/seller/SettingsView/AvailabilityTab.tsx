"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { updateAvailability } from "@/actions/seller/settings"
import type { SellerSettingsData } from "@/actions/seller/settings"

const Schema = z.object({
  availabilityStatus: z.enum(["available", "busy", "on_vacation"]),
  vacationAutoReply:  z.string().max(500).optional(),
  vacationReturnDate: z.string().optional(),
}).refine(
  d => d.availabilityStatus !== "on_vacation" || (d.vacationAutoReply && d.vacationAutoReply.length >= 10),
  { message: "Auto-reply message is required when on vacation (min 10 chars)", path: ["vacationAutoReply"] },
)
type FormData = z.infer<typeof Schema>

const STATUS_OPTIONS = [
  { value: "available",   label: "Available — accepting new orders" },
  { value: "busy",        label: "Busy — orders paused temporarily" },
  { value: "on_vacation", label: "On Vacation — fully away" },
]

export function AvailabilityTab({ defaults }: { defaults: SellerSettingsData }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved]             = useState(false)
  const [isPending, startTransition]  = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      availabilityStatus: defaults.availabilityStatus,
      vacationAutoReply:  defaults.vacationAutoReply,
      vacationReturnDate: defaults.vacationReturnDate,
    },
  })

  const status = form.watch("availabilityStatus")

  function onSubmit(data: FormData) {
    setServerError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateAvailability({
        availabilityStatus: data.availabilityStatus,
        vacationAutoReply:  data.vacationAutoReply,
        vacationReturnDate: data.vacationReturnDate,
      })
      if (!result.success) { setServerError(result.error ?? "Failed to save."); return }
      setSaved(true)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label>Availability Status</Label>
        <Select
          defaultValue={defaults.availabilityStatus}
          onValueChange={v => form.setValue("availabilityStatus", (v ?? "available") as FormData["availabilityStatus"], { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.availabilityStatus && (
          <p className="text-xs text-danger-600">{form.formState.errors.availabilityStatus.message}</p>
        )}
      </div>

      {status === "on_vacation" && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="vacationAutoReply">Auto-Reply Message</Label>
            <Textarea
              id="vacationAutoReply"
              rows={3}
              placeholder="I'm currently on vacation and will respond when I return…"
              {...form.register("vacationAutoReply")}
            />
            {form.formState.errors.vacationAutoReply && (
              <p className="text-xs text-danger-600">{form.formState.errors.vacationAutoReply.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vacationReturnDate">Return Date</Label>
            <Input
              id="vacationReturnDate"
              type="date"
              {...form.register("vacationReturnDate")}
              className="max-w-50"
            />
            {form.formState.errors.vacationReturnDate && (
              <p className="text-xs text-danger-600">{form.formState.errors.vacationReturnDate.message}</p>
            )}
          </div>
        </>
      )}

      {serverError && <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-3 py-2">{serverError}</p>}
      {saved && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">Availability saved successfully.</p>}

      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Changes"}</Button>
    </form>
  )
}
