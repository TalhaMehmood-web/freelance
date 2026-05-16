import type { Metadata } from "next"
import { AppHeader } from "@/components/layout/AppHeader"
import { Footer } from "@/components/layout/Footer"
import { getServerSession } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: {
    default: "FreelanceHub — Hire Top Freelancers or Find Work",
    template: "%s | FreelanceHub",
  },
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader variant="marketing" session={session} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
