import Link from "next/link"

export default function SellerSetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col bg-surface-subtle overflow-hidden">
      {/* Light decorative background — same as auth layout */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 w-120 h-120 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-100 h-100 rounded-full bg-brand-50/80 blur-3xl" />
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
      <header className="relative z-10 h-16 flex items-center px-8 border-b border-border/60 bg-surface/70 backdrop-blur-md gap-4">
        <Link href="/" className="text-lg font-bold text-text-primary tracking-tight">
          Freelance<span className="text-brand-500">Hub</span>
        </Link>
        <span className="text-border">|</span>
        <span className="text-sm text-text-tertiary">Seller Setup</span>
      </header>

      {/* Main — top-aligned, not vertically centered (multi-step form) */}
      <main className="relative z-10 flex-1 flex flex-col items-center py-10 px-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
