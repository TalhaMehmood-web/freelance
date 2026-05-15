import type { Metadata } from "next"
import { SellerSetupView } from "@/views/auth/SellerSetupView"
import { Step1Overview } from "@/views/auth/steps/Step1Overview"

export const metadata: Metadata = { title: "Seller Setup — Step 1 | FreelanceHub", robots: { index: false } }

export default function Step1Page() {
  return (
    <SellerSetupView step={1}>
      <Step1Overview />
    </SellerSetupView>
  )
}
