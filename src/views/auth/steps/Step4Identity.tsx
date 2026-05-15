"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock } from "lucide-react"
import { cn } from "@/lib/shared/utils"
import { useState } from "react"

const ID_TYPES = [
  { value: "passport", label: "Passport", description: "International travel document" },
  { value: "drivers_license", label: "Driver's License", description: "Government-issued driver ID" },
  { value: "national_id", label: "National ID Card", description: "National identity card" },
]

export function Step4Identity() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedType, setSelectedType] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    sessionStorage.setItem("seller_step4", JSON.stringify({
      idType: fd.get("idType"),
      idNumber: fd.get("idNumber"),
    }))
    startTransition(() => router.push("/seller-setup/step-5"))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Identity verification</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Verified sellers earn 3× more trust from buyers.
          </p>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4">
        <Lock className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-brand-700 mb-0.5">Bank-level encryption</p>
          <p className="text-xs text-brand-600 leading-relaxed">
            Your identity documents are encrypted end-to-end. We never store raw document images on our servers.
          </p>
        </div>
      </div>

      {/* Document type cards */}
      <div className="space-y-1.5">
        <Label>Document type</Label>
        <input type="hidden" name="idType" value={selectedType} />
        <div className="grid grid-cols-1 gap-2">
          {ID_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                selectedType === t.value
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                  : "border-border bg-surface hover:border-brand-200 hover:bg-brand-50/50"
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  selectedType === t.value ? "border-brand-500" : "border-border"
                )}
              >
                {selectedType === t.value && (
                  <div className="h-2 w-2 rounded-full bg-brand-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{t.label}</p>
                <p className="text-xs text-text-tertiary">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="idNumber">Document number</Label>
        <Input
          id="idNumber"
          name="idNumber"
          placeholder="Enter your document number"
          required
        />
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/seller-setup/step-3")}>
          ← Back
        </Button>
        <Button type="submit" disabled={pending || !selectedType}>
          {pending ? "Saving…" : "Continue →"}
        </Button>
      </div>
    </form>
  )
}
