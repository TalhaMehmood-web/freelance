"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/views/seller/GigCreateView/StepIndicator"
import { Step1Overview } from "@/views/seller/GigCreateView/Step1Overview"
import { Step2Pricing } from "@/views/seller/GigCreateView/Step2Pricing"
import { Step3Description } from "@/views/seller/GigCreateView/Step3Description"
import { Step4Gallery } from "@/views/seller/GigCreateView/Step4Gallery"
import { Step5Publish } from "@/views/seller/GigCreateView/Step5Publish"
import {
  GigBasicsSchema,
  GigPricingSchema,
  GigDescriptionSchema,
  GigGallerySchema,
  type GigBasicsData,
  type GigPricingData,
  type GigDescriptionData,
  type GigGalleryData,
} from "@/schemas/client/gigs"
import { updateGig } from "@/actions/gigs"

const TOTAL_STEPS = 5

interface GigEditViewProps {
  gigId:              string
  initialBasics:      GigBasicsData
  initialPricing:     GigPricingData
  initialDescription: GigDescriptionData
  initialGallery:     GigGalleryData
}

export function GigEditView({
  gigId,
  initialBasics,
  initialPricing,
  initialDescription,
  initialGallery,
}: GigEditViewProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Pre-initialized from props so Step 5 works even without stepping through all steps
  const [basicsData,      setBasicsData]      = useState<GigBasicsData | null>(initialBasics)
  const [pricingData,     setPricingData]     = useState<GigPricingData | null>(initialPricing)
  const [descriptionData, setDescriptionData] = useState<GigDescriptionData | null>(initialDescription)

  const basicsForm = useForm<GigBasicsData>({
    resolver: zodResolver(GigBasicsSchema),
    defaultValues: initialBasics,
  })

  const pricingForm = useForm<GigPricingData>({
    resolver: zodResolver(GigPricingSchema),
    defaultValues: initialPricing,
  })

  const descriptionForm = useForm<GigDescriptionData>({
    resolver: zodResolver(GigDescriptionSchema),
    defaultValues: initialDescription,
  })

  const galleryForm = useForm<GigGalleryData>({
    resolver: zodResolver(GigGallerySchema),
    defaultValues: initialGallery,
  })

  async function handleNext() {
    if (currentStep === 1) {
      const valid = await basicsForm.trigger()
      if (!valid) return
      setBasicsData(basicsForm.getValues())
    } else if (currentStep === 2) {
      const valid = await pricingForm.trigger()
      if (!valid) return
      setPricingData(pricingForm.getValues())
    } else if (currentStep === 3) {
      const valid = await descriptionForm.trigger()
      if (!valid) return
      setDescriptionData(descriptionForm.getValues())
    }
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  function handlePublish() {
    if (!basicsData || !pricingData || !descriptionData) return
    setServerError(null)
    startTransition(async () => {
      const result = await updateGig(gigId, {
        basics:      basicsData,
        pricing:     pricingData,
        description: descriptionData,
        gallery:     galleryForm.getValues(),
      })
      if (!result.success) {
        setServerError(result.error ?? "Something went wrong. Please try again.")
        return
      }
      router.push("/seller/gigs")
    })
  }

  const currentForm = ({
    1: basicsForm,
    2: pricingForm,
    3: descriptionForm,
    4: galleryForm,
    5: null,
  } as Record<number, UseFormReturn<any> | null>)[currentStep]

  const stepContent = {
    1: <Step1Overview />,
    2: <Step2Pricing />,
    3: <Step3Description />,
    4: <Step4Gallery />,
    5: <Step5Publish basicsData={basicsData} pricingData={pricingData} descriptionData={descriptionData} />,
  }[currentStep]

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Edit Gig</h1>
        <p className="text-sm text-text-secondary">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-10">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 min-h-100">
        {currentForm ? (
          <FormProvider {...currentForm}>
            {stepContent}
          </FormProvider>
        ) : (
          stepContent
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <p className="mt-4 text-sm text-warning-500 bg-warning-100 rounded-xl px-4 py-3 border border-warning-100">
          {serverError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? () => router.push("/seller/gigs") : handleBack}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < TOTAL_STEPS ? (
          <Button type="button" onClick={handleNext} className="gap-2">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPending || !basicsData || !pricingData || !descriptionData}
            className="gap-2 min-w-36"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
