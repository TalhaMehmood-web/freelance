import type { Metadata } from "next"
import { RegisterView } from "@/views/auth/RegisterView"

export const metadata: Metadata = {
  title: "Create Account | FreelanceHub",
  description: "Join 1 million+ professionals on FreelanceHub.",
  robots: { index: false },
}

export default function RegisterPage() {
  return <RegisterView />
}
