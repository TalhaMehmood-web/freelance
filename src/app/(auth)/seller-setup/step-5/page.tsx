import type { Metadata } from "next"
import { SellerSetupView } from "@/views/auth/SellerSetupView"
import { Step5Payout } from "@/views/auth/steps/Step5Payout"

export const metadata: Metadata = { title: "Seller Setup — Step 5 | FreelanceHub", robots: { index: false } }

export default function Step5Page() {
  return (
    <SellerSetupView step={5}>
      <Step5Payout />
    </SellerSetupView>
  )
}
