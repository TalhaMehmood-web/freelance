"use client"

import { useActionState, useState } from "react"
import { resetPassword } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { ActionResult } from "@/lib/shared/types"

const initialState: ActionResult<null> = { success: false, error: "" }

export function ResetPasswordView() {
  const [state, action, pending] = useActionState(resetPassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (state.success) {
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
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
        >
          Sign in now
        </Link>
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

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
              className="pr-10"
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              required
              className="pr-10"
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
        </div>

        {/* Password strength hint */}
        <div className="bg-surface-subtle border border-border rounded-xl px-3 py-2.5">
          <p className="text-xs text-text-tertiary">Password must contain:</p>
          <ul className="mt-1 space-y-0.5 text-xs text-text-tertiary">
            <li>· At least 8 characters</li>
            <li>· At least one uppercase letter</li>
            <li>· At least one number</li>
          </ul>
        </div>

        {state.error && (
          <p className="text-sm text-danger-600 bg-danger-50 rounded-xl px-3 py-2.5 border border-danger-100">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  )
}
