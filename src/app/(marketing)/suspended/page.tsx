import type { Metadata } from "next"
import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Account Suspended | FreelanceHub" }

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger-50 border border-danger-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-danger-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Account Suspended</h1>
        <p className="text-text-secondary mb-6">
          Your account has been suspended by our team. If you believe this is a mistake,
          please contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" render={<Link href="/login" />}>
            Back to Login
          </Button>
          <Button render={<Link href="mailto:support@freelancehub.com" />}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  )
}
