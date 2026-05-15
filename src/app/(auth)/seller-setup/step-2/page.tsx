import type { Metadata } from "next"
import { SellerSetupView } from "@/views/auth/SellerSetupView"
import { Step2Skills } from "@/views/auth/steps/Step2Skills"

export const metadata: Metadata = { title: "Seller Setup — Step 2 | FreelanceHub", robots: { index: false } }

export default function Step2Page() {
  return (
    <SellerSetupView step={2}>
      <Step2Skills />
    </SellerSetupView>
  )
}
