import Link from "next/link"
import { ShieldOff } from "lucide-react"

export default function NoAccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center">
          <ShieldOff className="w-6 h-6 text-danger-600" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Access Denied</h1>
        <p className="text-sm text-text-tertiary">
          You don&apos;t have permission to view this page. Contact your administrator if you believe this is a mistake.
        </p>
        <Link
          href="/admin/dashboard"
          className="text-sm text-brand-500 hover:underline mt-1"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
