import { Check } from "lucide-react"
import { cn } from "@/lib/shared/utils"

const STEPS = [
  { n: 1, label: "Overview" },
  { n: 2, label: "Skills" },
  { n: 3, label: "Education" },
  { n: 4, label: "Identity" },
  { n: 5, label: "Payout" },
]

interface Props {
  current: number
}

export function OnboardingStepIndicator({ current }: Props) {
  return (
    <nav aria-label="Seller setup steps" className="w-full">
      <ol className="flex items-center">
        {STEPS.map((step, i) => {
          const done = step.n < current
          const active = step.n === current
          return (
            <li key={step.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                    done
                      ? "bg-brand-500 text-white shadow-[0_0_12px_var(--color-brand-400)/0.5]"
                      : active
                      ? "bg-brand-500 text-white ring-4 ring-brand-100 shadow-[0_0_16px_var(--color-brand-400)/0.6]"
                      : "bg-surface border-2 border-border text-text-tertiary"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : step.n}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block whitespace-nowrap",
                    active ? "text-brand-500" : done ? "text-text-secondary" : "text-text-tertiary"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 mb-5 rounded-full transition-all duration-300",
                    done ? "bg-brand-400" : "bg-border"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
