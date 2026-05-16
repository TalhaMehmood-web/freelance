import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col bg-surface-subtle overflow-hidden">
      {/* Light decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 w-120 h-120 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-100 h-100 rounded-full bg-brand-50/80 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-brand-50/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, var(--color-brand-400) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-border/60 bg-surface/70 backdrop-blur-md">
        <Link href="/" className="text-lg font-bold text-text-primary tracking-tight">
          Freelance<span className="text-brand-500">Hub</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-text-tertiary border-t border-border/40 bg-surface/50 backdrop-blur-sm">
        © 2025 FreelanceHub, Inc. All rights reserved.
      </footer>
    </div>
  )
}
