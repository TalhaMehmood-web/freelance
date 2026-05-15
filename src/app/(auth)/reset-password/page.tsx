import type { Metadata } from "next"
import { ResetPasswordView } from "@/views/auth/ResetPasswordView"

export const metadata: Metadata = {
  title: "Reset Password | FreelanceHub",
  robots: { index: false },
}

export default function ResetPasswordPage() {
  return <ResetPasswordView />
}
