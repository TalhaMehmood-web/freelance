import type { Metadata } from "next"
import { ForgotPasswordView } from "@/views/auth/ForgotPasswordView"

export const metadata: Metadata = {
  title: "Forgot Password | FreelanceHub",
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
