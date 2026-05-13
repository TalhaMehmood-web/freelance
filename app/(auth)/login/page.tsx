import type { Metadata } from "next"
import { LoginView } from "@/views/auth/LoginView"

export const metadata: Metadata = {
  title: "Sign In | FreelanceHub",
  description: "Sign in to your FreelanceHub account.",
  robots: { index: false },
}

export default function LoginPage() {
  return <LoginView />
}
