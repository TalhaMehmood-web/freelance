import Link from "next/link"
import { APP_NAME } from "@/lib/shared/constants"

const FOOTER_LINKS = {
  Platform: [
    { label: "Browse Gigs", href: "/gigs" },
    { label: "Find Talent", href: "/freelancers" },
    { label: "Post a Job", href: "/jobs" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Community", href: "/community" },
    { label: "Status", href: "https://status.freelancehub.com" },
    { label: "Dispute Resolution", href: "/help/disputes" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-semibold text-text-primary tracking-tight">
              Freelance<span className="text-brand-500">Hub</span>
            </Link>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              The enterprise-grade marketplace connecting businesses with the world&apos;s best freelance talent.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-4">
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-tertiary">
            © 2025 {APP_NAME}, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-text-tertiary">
            <span>English</span>
            <span>USD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
