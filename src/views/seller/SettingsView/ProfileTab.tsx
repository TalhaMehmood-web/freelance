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
import { updateProfile } from "@/actions/seller/settings"
import type { SellerSettingsData } from "@/actions/seller/settings"

const Schema = z.object({
  displayName:         z.string().min(2, "Min 2 characters").max(60),
  professionalTitle:   z.string().min(5, "Min 5 characters").max(120),
  overview:            z.string().min(20, "Min 20 characters").max(2000),
  country:             z.string().min(1, "Country is required"),
  payoutCurrency:      z.string().min(1, "Currency is required"),
  maxConcurrentOrders: z.coerce.number().int().min(1).max(50),
})
type FormData = z.infer<typeof Schema>

const COUNTRIES = [
  { value: "PK", label: "Pakistan" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "IN", label: "India" },
  { value: "DE", label: "Germany" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
]

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "PKR", label: "PKR — Pakistani Rupee" },
]

export function ProfileTab({ defaults }: { defaults: SellerSettingsData }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved]             = useState(false)
  const [isPending, startTransition]  = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(Schema) as any,
    defaultValues: {
      displayName:         defaults.displayName,
      professionalTitle:   defaults.professionalTitle,
      overview:            defaults.overview,
      country:             defaults.country,
      payoutCurrency:      defaults.payoutCurrency,
      maxConcurrentOrders: defaults.maxConcurrentOrders,
    },
  })

  function onSubmit(data: any) {
    setServerError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateProfile(data)
      if (!result.success) { setServerError(result.error ?? "Failed to save."); return }
      setSaved(true)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" {...form.register("displayName")} />
        {form.formState.errors.displayName && (
          <p className="text-xs text-danger-600">{form.formState.errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="professionalTitle">Professional Title</Label>
        <Input id="professionalTitle" placeholder="Full-Stack Developer | Next.js & TypeScript Expert" {...form.register("professionalTitle")} />
        {form.formState.errors.professionalTitle && (
          <p className="text-xs text-danger-600">{form.formState.errors.professionalTitle.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="overview">Overview</Label>
        <Textarea id="overview" rows={5} placeholder="Describe your skills, experience, and what makes you unique…" {...form.register("overview")} />
        {form.formState.errors.overview && (
          <p className="text-xs text-danger-600">{form.formState.errors.overview.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Select defaultValue={defaults.country ?? ""} onValueChange={v => form.setValue("country", v ?? "", { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {form.formState.errors.country && (
            <p className="text-xs text-danger-600">{form.formState.errors.country.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Payout Currency</Label>
          <Select defaultValue={defaults.payoutCurrency ?? ""} onValueChange={v => form.setValue("payoutCurrency", v ?? "", { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maxConcurrentOrders">Max Concurrent Orders</Label>
        <Input id="maxConcurrentOrders" type="number" min={1} max={50} {...form.register("maxConcurrentOrders")} className="max-w-[120px]" />
        <p className="text-xs text-text-tertiary">Buyers cannot place new orders once this limit is reached</p>
        {form.formState.errors.maxConcurrentOrders && (
          <p className="text-xs text-danger-600">{form.formState.errors.maxConcurrentOrders.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-3 py-2">{serverError}</p>}
      {saved && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">Profile saved successfully.</p>}

      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Changes"}</Button>
    </form>
  )
}
