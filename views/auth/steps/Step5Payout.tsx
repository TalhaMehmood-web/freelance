"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CreditCard, Building, Wallet, Sparkles, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/shared/utils"

const METHODS = [
  {
    value: "stripe",
    icon: CreditCard,
    label: "Bank transfer via Stripe",
    description: "Direct to your bank in 2–5 business days. Lowest fees.",
    badge: "Recommended",
  },
  {
    value: "paypal",
    icon: Wallet,
    label: "PayPal",
    description: "Instant to your PayPal balance. Standard PayPal fees apply.",
    badge: null,
  },
  {
    value: "bank",
    icon: Building,
    label: "Wire transfer",
    description: "International wire for enterprise sellers. 5–7 business days.",
    badge: null,
  },
]

export function Step5Payout() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string>("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    sessionStorage.setItem("seller_step5", JSON.stringify({ payoutMethod: selected }))
    startTransition(async () => {
      const step1 = JSON.parse(sessionStorage.getItem("seller_step1") ?? "{}")
      const step2 = JSON.parse(sessionStorage.getItem("seller_step2") ?? "{}")
      const step3 = JSON.parse(sessionStorage.getItem("seller_step3") ?? "{}")
      const step4 = JSON.parse(sessionStorage.getItem("seller_step4") ?? "{}")
      const step5 = { payoutMethod: selected }

      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...step1, ...step2, ...step3, ...step4, ...step5 }),
      })

      if (res.ok) {
        ;["seller_step1", "seller_step2", "seller_step3", "seller_step4", "seller_step5"].forEach(
          (k) => sessionStorage.removeItem(k)
        )
        router.push("/seller/dashboard")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Set up payouts</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Choose how you&apos;ll receive your earnings. You can change this later.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelected(m.value)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200",
              selected === m.value
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100 shadow-[0_0_0_4px_var(--color-brand-100)]"
                : "border-border bg-surface hover:border-brand-200 hover:bg-surface-subtle"
            )}
          >
            <div
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all",
                selected === m.value
                  ? "bg-brand-500 text-white shadow-[0_4px_12px_var(--color-brand-500)/0.4]"
                  : "bg-surface-muted text-text-tertiary"
              )}
            >
              <m.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                {m.badge && (
                  <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-full bg-success-100 text-success-700">
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">{m.description}</p>
            </div>
            {selected === m.value && (
              <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Final CTA context */}
      {selected && (
        <div className="bg-success-50 border border-success-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
          <p className="text-xs text-success-700">
            Almost done! Click <strong>Complete setup</strong> to launch your seller profile.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={() => router.push("/seller-setup/step-4")}>
          ← Back
        </Button>
        <Button type="submit" disabled={pending || !selected}>
          {pending ? "Finishing…" : "Complete setup 🎉"}
        </Button>
      </div>
    </form>
  )
}
