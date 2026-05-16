import { z } from "zod"

export const FreelancerSearchParamsSchema = z.object({
  q:            z.string().max(200).default(""),
  category:     z.string().max(100).default(""),
  sellerLevel:  z.enum(["", "new", "level_1", "level_2", "top_rated"]).default(""),
  minRating:    z.string().regex(/^(|[0-9]+(\.[0-9]+)?)$/).default(""),
  minHourlyRate:z.string().regex(/^[0-9]*$/).default(""),
  maxHourlyRate:z.string().regex(/^[0-9]*$/).default(""),
  availability: z.enum(["", "available", "busy"]).default(""),
  sort:         z.enum(["relevance", "rating", "orders", "newest"]).default("relevance"),
})

export type FreelancerFilters = z.infer<typeof FreelancerSearchParamsSchema>

export const UsernameSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9_]+$/)
