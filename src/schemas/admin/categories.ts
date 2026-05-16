import { z } from "zod"

export const CategoryFormSchema = z.object({
  name:      z.string().min(2, "Min 2 characters").max(60, "Max 60 characters"),
  slug:      z.string().min(2, "Min 2 characters").max(80, "Max 80 characters")
              .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
  parentId:  z.string().optional(),
  icon:      z.string().max(50).optional(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
})

export type CategoryFormData = z.infer<typeof CategoryFormSchema>

export const CategoryUpdateSchema = CategoryFormSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CategoryUpdateData = z.infer<typeof CategoryUpdateSchema>
