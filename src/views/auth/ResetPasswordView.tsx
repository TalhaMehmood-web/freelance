"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react"
import { resetPassword } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResetPasswordSchema } from "@/lib/shared/validations"

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

export function ResetPasswordView() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  function onSubmit(data: ResetPasswordFormData) {
    setServerError(null)
    startTransition(async () => {
      const result = await resetPassword(data)
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
        <h1 className="text-2xl font-bold text-text-primary mb-2">Password updated!</h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <Button className="w-full" size="lg" render={<Link href="/login" />}>
          Sign in now
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="relative inline-flex mb-6">
        <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center">
          <KeyRound className="h-7 w-7 text-brand-500" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-brand-400/25 blur-lg" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1.5">Set a new password</h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Choose a strong password to secure your account.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              aria-invalid={!!form.formState.errors.password}
              className="pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-danger-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={!!form.formState.errors.confirmPassword}
              className="pr-10"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-danger-600">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="bg-surface-subtle border border-border rounded-xl px-3 py-2.5">
          <p className="text-xs text-text-tertiary">Password must contain:</p>
          <ul className="mt-1 space-y-0.5 text-xs text-text-tertiary">
            <li>· At least 8 characters</li>
            <li>· At least one uppercase letter</li>
            <li>· At least one number</li>
          </ul>
        </div>

        {serverError && (
          <p className="text-sm text-danger-600 bg-danger-50 rounded-xl px-3 py-2.5 border border-danger-100">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  )
}
