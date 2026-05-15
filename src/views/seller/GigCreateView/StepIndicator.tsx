import { Check } from "lucide-react"
import { cn } from "@/lib/shared/utils"

const STEPS = [
  { label: "Overview",    number: 1 },
  { label: "Pricing",     number: 2 },
  { label: "Description", number: 3 },
  { label: "Gallery",     number: 4 },
  { label: "Publish",     number: 5 },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const isDone    = currentStep > step.number
        const isActive  = currentStep === step.number
        const isLast    = i === STEPS.length - 1

        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-none">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                  isDone   && "bg-brand-500 border-brand-500 text-white",
                  isActive && "bg-surface border-brand-500 text-brand-600 shadow-[0_0_0_4px_var(--color-brand-100)]",
                  !isDone && !isActive && "bg-surface border-border text-text-tertiary"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive && "text-brand-600",
                  isDone   && "text-text-secondary",
                  !isDone && !isActive && "text-text-tertiary"
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 mt-[-18px] sm:mt-[-22px] transition-colors",
                  currentStep > step.number ? "bg-brand-500" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
