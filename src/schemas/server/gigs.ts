import { z } from "zod"

export const GigSearchParamsSchema = z.object({
  q:            z.string().max(200).optional().default(""),
  category:     z.string().max(100).optional().default(""),
  subcategory:  z.string().max(100).optional().default(""),
  minPrice:     z.coerce.number().min(0).max(100_000).optional().transform(v => v?.toString() ?? ""),
  maxPrice:     z.coerce.number().min(0).max(100_000).optional().transform(v => v?.toString() ?? ""),
  deliveryDays: z.enum(["", "1", "3", "7", "14"]).optional().default(""),
  sellerLevel:  z.enum(["", "new", "level_1", "level_2", "top_rated"]).optional().default(""),
  minRating:    z.enum(["", "3.5", "4.0", "4.5"]).optional().default(""),
  sort:         z.enum(["relevance", "orders", "newest", "price_asc", "price_desc", "rating"]).optional().default("relevance"),
})

export type GigSearchParams = z.infer<typeof GigSearchParamsSchema>

export const GigSlugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")

export const SellerGigQuerySchema = z.object({
  status: z.enum(["", "active", "paused", "draft"]).optional().default(""),
  sort:   z.enum(["newest", "oldest", "orders", "impressions", "price_asc", "price_desc"])
            .optional()
            .default("newest"),
})

export type SellerGigQuery = z.infer<typeof SellerGigQuerySchema>
