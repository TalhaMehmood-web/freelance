import type { Metadata } from "next"
import { SellerSetupView } from "@/views/auth/SellerSetupView"
import { Step3Education } from "@/views/auth/steps/Step3Education"

export const metadata: Metadata = { title: "Seller Setup — Step 3 | FreelanceHub", robots: { index: false } }

export default function Step3Page() {
  return (
    <SellerSetupView step={3}>
      <Step3Education />
    </SellerSetupView>
  )
}
