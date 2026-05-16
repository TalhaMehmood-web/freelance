"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight, Loader2, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/views/seller/GigCreateView/StepIndicator"
import { Step1Overview } from "@/views/seller/GigCreateView/Step1Overview"
import { Step2Pricing } from "@/views/seller/GigCreateView/Step2Pricing"
import { Step3Description } from "@/views/seller/GigCreateView/Step3Description"
import { Step4Gallery } from "@/views/seller/GigCreateView/Step4Gallery"
import { Step5Publish } from "@/views/seller/GigCreateView/Step5Publish"
import { GigLivePreview } from "@/views/seller/GigCreateView/GigLivePreview"
import {
  GigBasicsSchema, GigPricingSchema, GigDescriptionSchema, GigGallerySchema,
  type GigBasicsData, type GigPricingData, type GigDescriptionData, type GigGalleryData,
} from "@/schemas/client/gigs"
import { updateGig } from "@/actions/gigs"
import { GigWizardProvider } from "@/views/seller/GigCreateView/GigWizardContext"
import type { CategoryWithChildren } from "@/actions/categories"

const TOTAL_STEPS = 5

const STEP_META = [
  { title: "Gig Overview",       subtitle: "Title, category & search tags" },
  { title: "Pricing & Packages", subtitle: "Set your packages and rates" },
  { title: "Description & FAQ",  subtitle: "Tell buyers what you offer" },
  { title: "Gallery",            subtitle: "Images that showcase your work" },
  { title: "Review & Save",      subtitle: "Final check before saving" },
]

interface GigEditViewProps {
  gigId:              string
  initialBasics:      GigBasicsData
  initialPricing:     GigPricingData
  initialDescription: GigDescriptionData
  initialGallery:     GigGalleryData
  categories?:        CategoryWithChildren[]
}

export function GigEditView({
  gigId,
  initialBasics,
  initialPricing,
  initialDescription,
  initialGallery,
  categories = [],
}: GigEditViewProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

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
    } else if (currentStep === 4) {
      // gallery is optional
    }
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  function handleBack() {
    setCurrentStep(s => Math.max(s - 1, 1))
  }

  function handleSave() {
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

  const meta = STEP_META[currentStep - 1]

  return (
    <GigWizardProvider categories={categories}>
      <div className="flex flex-col gap-0 min-h-full">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
              <Save className="w-4 h-4 text-brand-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary leading-none">Edit Gig</h1>
              <p className="text-xs text-text-tertiary mt-0.5">Step {currentStep} of {TOTAL_STEPS} — {meta.subtitle}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/seller/gigs")}>
            Cancel
          </Button>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* Left — form card */}
          <div className="bg-surface rounded-2xl border border-border shadow-card">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text-primary">{meta.title}</h2>
              <p className="text-xs text-text-secondary mt-0.5">{meta.subtitle}</p>
            </div>

            <div className="p-6">
              {currentForm ? (
                <FormProvider {...currentForm}>
                  {stepContent}
                </FormProvider>
              ) : (
                stepContent
              )}
            </div>

            <div className="px-6 py-4 border-t border-border bg-surface-subtle rounded-b-2xl flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? () => router.push("/seller/gigs") : handleBack}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>

              <div className="flex items-center gap-2">
                {serverError && (
                  <p className="text-xs text-danger-600 max-w-xs text-right">{serverError}</p>
                )}
                {currentStep < TOTAL_STEPS ? (
                  <Button type="button" onClick={handleNext} className="gap-1.5 min-w-28">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending || !basicsData || !pricingData || !descriptionData}
                    className="gap-1.5 min-w-36"
                  >
                    {isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right — live preview */}
          <div className="lg:sticky lg:top-6">
            <GigLivePreview
              currentStep={currentStep}
              basicsForm={basicsForm}
              pricingForm={pricingForm}
              descriptionForm={descriptionForm}
              galleryForm={galleryForm}
            />
          </div>
        </div>
      </div>
    </GigWizardProvider>
  )
}
