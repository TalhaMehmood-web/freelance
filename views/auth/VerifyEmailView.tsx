import Link from "next/link"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"

export function VerifyEmailView() {
  return (
    <div className="w-full max-w-sm text-center">
      {/* Glowing mail icon */}
      <div className="relative inline-flex mb-6">
        <div className="h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
          <Mail className="h-9 w-9 text-brand-500" />
        </div>
        <div className="absolute inset-0 rounded-full bg-brand-400/25 blur-xl" />
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">Verify your email</h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-1">
        We sent a confirmation link to your email address.
      </p>
      <p className="text-sm text-text-secondary leading-relaxed mb-6">
        Click the link to activate your account.
      </p>

      {/* Hint card */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-8 shadow-card text-left space-y-3">
        <p className="text-xs font-semibold text-text-primary">Didn&apos;t receive it?</p>
        <ul className="space-y-2 text-xs text-text-secondary">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
            Check your spam or junk folder
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
            Make sure you entered the correct email
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
            Wait up to 2 minutes for delivery
          </li>
        </ul>
        <button className="flex items-center gap-1.5 text-xs text-brand-500 font-medium hover:text-brand-600 transition-colors mt-1">
          <RefreshCw className="h-3 w-3" />
          Resend the email
        </button>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  )
}
