import Link from "next/link";
import { Star, Shield, Zap, CheckCircle2 } from "lucide-react";

const TESTIMONIAL = {
  quote:
    "FreelanceHub helped us hire a world-class design team in 48 hours. The quality and speed was unreal.",
  author: "Sarah Chen",
  role: "CTO at NovaTech",
};

const TRUST_POINTS = [
  "1M+ vetted freelancers worldwide",
  "Secure escrow payments",
  "24/7 dedicated support",
  "Enterprise-grade compliance",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-brand-500">
        {/* Mesh gradient layers */}
        <div className="absolute inset-0 bg-linear-to-br from-brand-400 via-brand-500 to-brand-700" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-brand-700/40 blur-3xl" />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-white tracking-tight"
          >
            Freelance<span className="text-white/70">Hub</span>
          </Link>

          {/* Centre content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-3 inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
              <Zap className="h-3 w-3" />
              Enterprise-grade freelance platform
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Hire the world&apos;s best.
              <br />
              Get work done faster.
            </h2>
            <p className="text-brand-100 text-base leading-relaxed mb-8 max-w-sm">
              Connect with top-tier freelancers or land your next big project.
              Trusted by 500,000+ companies worldwide.
            </p>

            {/* Trust points */}
            <ul className="space-y-3 mb-10">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm text-white/90"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-200 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>

            {/* Testimonial card */}
            <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 backdrop-blur-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-accent-400 text-accent-400"
                  />
                ))}
              </div>
              <p className="text-sm text-white/90 leading-relaxed mb-4 italic">
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
                  {TESTIMONIAL.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {TESTIMONIAL.author}
                  </p>
                  <p className="text-xs text-brand-200">{TESTIMONIAL.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-2 text-xs text-brand-200">
            <Shield className="h-3.5 w-3.5" />
            <span>Bank-grade security · SOC 2 Type II · GDPR compliant</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <header className="lg:hidden h-14 flex items-center px-6 border-b border-border bg-surface">
          <Link
            href="/"
            className="text-lg font-semibold text-text-primary tracking-tight"
          >
            Freelance<span className="text-brand-500">Hub</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-surface-subtle">
          {children}
        </main>

        <footer className="py-4 text-center text-xs text-text-tertiary bg-surface-subtle border-t border-border">
          © 2025 FreelanceHub, Inc. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
