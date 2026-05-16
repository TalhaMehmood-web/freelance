import type { Metadata } from "next"
import { SellerSetupView } from "@/views/auth/SellerSetupView"
import { Step4Identity } from "@/views/auth/steps/Step4Identity"

export const metadata: Metadata = { title: "Seller Setup — Step 4 | FreelanceHub", robots: { index: false } }

export default function Step4Page() {
  return (
    <SellerSetupView step={4}>
      <Step4Identity />
    </SellerSetupView>
  )
}
