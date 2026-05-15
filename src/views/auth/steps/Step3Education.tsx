"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Info } from "lucide-react"

export function Step3Education() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      institution: fd.get("institution"),
      degree: fd.get("degree"),
      field: fd.get("field"),
      graduationYear: fd.get("graduationYear"),
    }
    sessionStorage.setItem("seller_step3", JSON.stringify({ education: [data] }))
    startTransition(() => router.push("/seller-setup/step-4"))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <GraduationCap className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Education</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Add your educational background to increase buyer trust.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-surface-subtle border border-border rounded-xl px-4 py-3">
        <Info className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed">
          This step is <strong>optional</strong>. You can skip it and add education later from your profile settings.
        </p>
      </div>

      <div className="border border-border rounded-2xl p-5 space-y-4 bg-surface">
        <div className="space-y-1.5">
          <Label htmlFor="institution">Institution</Label>
          <Input id="institution" name="institution" placeholder="e.g. MIT, Stanford University, Self-taught" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="degree">Degree</Label>
            <Input id="degree" name="degree" placeholder="e.g. B.Sc., M.Sc." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="field">Field of study</Label>
            <Input id="field" name="field" placeholder="e.g. Computer Science" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="graduationYear">Graduation year</Label>
          <Input
            id="graduationYear"
            name="graduationYear"
            type="number"
            min={1950}
            max={2033}
            placeholder="e.g. 2020"
            className="max-w-40"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/seller-setup/step-2")}>
          ← Back
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => startTransition(() => router.push("/seller-setup/step-4"))}
            disabled={pending}
          >
            Skip
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Continue →"}
          </Button>
        </div>
      </div>
    </form>
  )
}
