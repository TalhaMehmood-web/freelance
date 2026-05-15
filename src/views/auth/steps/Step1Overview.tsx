"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Globe, Lightbulb } from "lucide-react"

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "India", "Pakistan", "Nigeria", "Philippines", "Brazil", "Other",
]

export function Step1Overview() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      professionalTitle: fd.get("professionalTitle"),
      bio: fd.get("bio"),
      country: fd.get("country"),
    }
    sessionStorage.setItem("seller_step1", JSON.stringify(data))
    startTransition(() => router.push("/seller-setup/step-2"))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <User className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Your professional overview</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            This is the first thing buyers see when they visit your profile.
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2.5 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
        <Lightbulb className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
        <p className="text-xs text-brand-700 leading-relaxed">
          Sellers with complete profiles earn <strong>3× more</strong>. Be specific, professional, and let your personality shine.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="professionalTitle">Professional title</Label>
        <Input
          id="professionalTitle"
          name="professionalTitle"
          placeholder="e.g. Full-Stack Developer | React & Node.js Expert"
          maxLength={100}
          required
        />
        <p className="text-xs text-text-tertiary">Min 10 characters · Be specific about your expertise</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Professional bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Describe your experience, expertise, and what makes you the right choice for clients…"
          rows={6}
          maxLength={3000}
          required
        />
        <p className="text-xs text-text-tertiary">Min 50 characters · Write in first person</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="country" className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-text-tertiary" />
          Country
        </Label>
        <select
          id="country"
          name="country"
          className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
          required
        >
          <option value="">Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Continue →"}
        </Button>
      </div>
    </form>
  )
}
