import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "FreelanceHub — Hire Top Freelancers or Find Work",
    template: "%s | FreelanceHub",
  },
  description:
    "FreelanceHub is an enterprise-grade marketplace connecting businesses with top freelance talent worldwide.",
  keywords: ["freelance", "hire freelancers", "find work", "gig marketplace", "remote work"],
  authors: [{ name: "FreelanceHub" }],
  creator: "FreelanceHub",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FreelanceHub",
    title: "FreelanceHub — Hire Top Freelancers or Find Work",
    description:
      "Enterprise-grade freelance marketplace. Post jobs, browse gigs, and collaborate with confidence.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "FreelanceHub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelanceHub — Hire Top Freelancers or Find Work",
    description: "Enterprise-grade freelance marketplace connecting businesses with top talent.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-surface-subtle text-text-primary font-sans antialiased">
        <Suspense>
          <TooltipProvider>{children}</TooltipProvider>
        </Suspense>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
            },
          }}
        />
      </body>
    </html>
  )
}
