"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react"
import { forgotPassword } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ForgotPasswordSchema } from "@/lib/shared/validations"

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>

export function ForgotPasswordView() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(data: ForgotPasswordFormData) {
    setServerError(null)
    startTransition(async () => {
      const result = await forgotPassword(data)
      if (result.success) {
        setSuccess(true)
      } else {
        setServerError(result.error ?? "Something went wrong")
      }
    })
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="relative inline-flex mb-6">
          <div className="h-20 w-20 rounded-full bg-success-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-success-500" />
          </div>
          <div className="absolute inset-0 rounded-full bg-success-500/20 blur-xl" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Check your inbox</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-1">
          We&apos;ve sent a password reset link to your email address.
        </p>
        <p className="text-xs text-text-tertiary mb-8">The link expires in 1 hour.</p>
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-6 flex items-center gap-3 text-left">
          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-brand-500" />
          </div>
          <p className="text-xs text-brand-700 leading-relaxed">
            Didn&apos;t receive it? Check your spam folder or wait a moment and try again.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-brand-500 font-medium hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="relative inline-flex mb-6">
        <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Mail className="h-7 w-7 text-brand-500" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-brand-400/25 blur-lg" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1.5">Forgot your password?</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          No worries. Enter your email and we&apos;ll send you a reset link right away.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-danger-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-danger-600 bg-danger-50 rounded-xl px-3 py-2.5 border border-danger-100">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  )
}
