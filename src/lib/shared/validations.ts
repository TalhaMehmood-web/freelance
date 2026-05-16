import { z } from "zod"

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or less")
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]+$/, "Name contains invalid characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, { error: "You must accept the terms" }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// ─── Seller Onboarding ────────────────────────────────────────────────────────

export const SellerStep1Schema = z.object({
  professionalTitle: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be 100 characters or less"),
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(3000, "Bio must be 3000 characters or less"),
  country: z.string().min(1, "Country is required"),
  language: z.string().min(1, "Language is required"),
})

export const SellerStep2Schema = z.object({
  skillIds: z
    .array(z.string())
    .min(1, "Add at least one skill")
    .max(15, "Maximum 15 skills"),
})

export const SellerStep3Schema = z.object({
  education: z.array(
    z.object({
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().optional(),
      field: z.string().optional(),
      graduationYear: z.number().int().min(1950).max(new Date().getFullYear() + 8).optional(),
    })
  ).optional(),
  certifications: z.array(
    z.object({
      name: z.string().min(1, "Certification name is required"),
      issuer: z.string().min(1, "Issuer is required"),
      year: z.number().int().min(1990).max(new Date().getFullYear()).optional(),
    })
  ).optional(),
})

export const SellerStep4Schema = z.object({
  idType: z.enum(["passport", "drivers_license", "national_id"]),
  idNumber: z.string().min(4, "ID number is required"),
})

export const SellerStep5Schema = z.object({
  payoutMethod: z.enum(["stripe", "paypal", "bank"]),
})

// ─── Gigs ─────────────────────────────────────────────────────────────────────

export const GigBasicsSchema = z.object({
  title: z
    .string()
    .min(15, "Title must be at least 15 characters")
    .max(80, "Title must be 80 characters or less"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  searchTags: z
    .array(z.string().max(20))
    .min(1, "Add at least one tag")
    .max(5, "Maximum 5 tags"),
})

export const GigPackageSchema = z.object({
  name: z.enum(["basic", "standard", "premium"]),
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(300),
  deliveryDays: z.number().int().min(1).max(365),
  revisions: z.number().int().min(0).max(99),
  priceCents: z.number().int().min(500).max(100_000_00),
})

export const GigDescriptionSchema = z.object({
  description: z.string().min(120, "Description must be at least 120 characters").max(12000),
  faq: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .max(10)
    .optional(),
})

// ─── Orders ───────────────────────────────────────────────────────────────────

export const CreateOrderSchema = z.object({
  gigPackageId: z.string().min(1),
  requirements: z.string().max(5000).optional(),
  couponCode: z.string().optional(),
})

export const DeliverOrderSchema = z.object({
  message: z.string().min(1, "Add a delivery message").max(5000),
  fileUrls: z.array(z.string().url()).max(10).optional(),
})

export const RevisionRequestSchema = z.object({
  message: z.string().min(10, "Please describe what needs to be revised").max(2000),
})

export const DisputeSchema = z.object({
  reason: z.enum(["not_as_described", "not_delivered", "quality_issue", "communication", "other"]),
  description: z.string().min(50, "Please describe the issue in detail").max(5000),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
})

// ─── Messages ─────────────────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(10000),
  fileUrls: z.array(z.string().url()).max(5).optional(),
})

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10, "Review must be at least 10 characters").max(3000),
})

// ─── Profile ──────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  bio: z.string().max(3000).optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
})

// ─── Job Posts ────────────────────────────────────────────────────────────────

export const CreateJobSchema = z.object({
  title: z.string().min(10).max(150),
  description: z.string().min(100).max(20000),
  categoryId: z.string().min(1),
  budgetType: z.enum(["fixed", "hourly"]),
  budgetMinCents: z.number().int().min(500).optional(),
  budgetMaxCents: z.number().int().min(500).optional(),
  duration: z.enum(["less_than_1_week", "1_to_4_weeks", "1_to_3_months", "3_to_6_months", "more_than_6_months"]),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]),
  skillIds: z.array(z.string()).min(1).max(10),
})

// ─── Org ──────────────────────────────────────────────────────────────────────

export const CreateOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  plan: z.enum(["free", "pro", "business", "enterprise"]),
})

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "billing_manager", "viewer"]),
})
