import Link from "next/link"

export default function SellerSetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-subtle flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-border bg-surface">
        <Link href="/" className="text-lg font-semibold text-text-primary tracking-tight">
          Freelance<span className="text-brand-500">Hub</span>
        </Link>
        <span className="ml-4 text-sm text-text-tertiary border-l border-border pl-4">
          Seller Setup
        </span>
      </header>
      <main className="flex-1 flex flex-col items-center py-10 px-6">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  )
}
