import { z } from "zod"

export const GigBasicsSchema = z.object({
  title:          z.string().min(15, "Title must be at least 15 characters").max(80, "Max 80 characters"),
  categoryId:     z.string().min(1, "Category is required"),
  subcategoryId:  z.string().optional(),
  searchTags:     z.array(z.string().max(20)).min(1, "Add at least one tag").max(5, "Maximum 5 tags"),
})

export const GigSinglePackageSchema = z.object({
  enabled:      z.boolean(),
  name:         z.string().min(1, "Package name is required").max(60),
  description:  z.string().min(1, "Description is required").max(300),
  deliveryDays: z.number().int().min(1, "Min 1 day").max(365, "Max 365 days"),
  revisions:    z.number().int().min(0).max(99),
  priceCents:   z.number().int().min(500, "Min price $5").max(10_000_00, "Max price $10,000"),
})

export const GigPricingSchema = z.object({
  basic:    GigSinglePackageSchema,
  standard: GigSinglePackageSchema,
  premium:  GigSinglePackageSchema,
}).refine(
  (data) => data.basic.enabled || data.standard.enabled || data.premium.enabled,
  { message: "At least one package must be enabled", path: ["basic"] }
)

export const GigDescriptionSchema = z.object({
  description: z.string().min(120, "Description must be at least 120 characters").max(12_000),
  faqs:        z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      answer:   z.string().min(1, "Answer is required"),
    })
  ).max(10),
})

export const GigGallerySchema = z.object({
  coverImageUrl:  z.string().url().optional().or(z.literal("")),
  galleryImages:  z.array(z.string().url()).max(3),
})

export type GigBasicsData     = z.infer<typeof GigBasicsSchema>
export type GigPricingData    = z.infer<typeof GigPricingSchema>
export type GigDescriptionData= z.infer<typeof GigDescriptionSchema>
export type GigGalleryData    = z.infer<typeof GigGallerySchema>
