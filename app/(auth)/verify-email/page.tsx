import type { Metadata } from "next"
import { VerifyEmailView } from "@/views/auth/VerifyEmailView"

export const metadata: Metadata = {
  title: "Verify Email | FreelanceHub",
  robots: { index: false },
}

export default function VerifyEmailPage() {
  return <VerifyEmailView />
}
