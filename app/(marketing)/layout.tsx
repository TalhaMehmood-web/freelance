import type { Metadata } from "next"
import { AppHeader } from "@/components/layout/AppHeader"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: {
    default: "FreelanceHub — Hire Top Freelancers or Find Work",
    template: "%s | FreelanceHub",
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader variant="marketing" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
