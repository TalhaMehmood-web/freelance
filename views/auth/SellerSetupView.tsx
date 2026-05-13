import { OnboardingStepIndicator } from "./OnboardingStepIndicator"
import { Sparkles } from "lucide-react"

interface Props {
  step: number
  children: React.ReactNode
}

export function SellerSetupView({ step, children }: Props) {
  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Seller onboarding — Step {step} of 5
        </div>
        <p className="text-sm text-text-secondary">Complete your profile to start selling on FreelanceHub</p>
      </div>

      {/* Step indicator */}
      <OnboardingStepIndicator current={step} />

      {/* Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-elevated p-8">
        {children}
      </div>
    </div>
  )
}
