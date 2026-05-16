import { type NextRequest, NextResponse } from "next/server"

/*
 * proxy.ts — the ONLY request interceptor in Next.js 16.
 * Handles: auth redirects, role routing, header injection, security headers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Auth routing ────────────────────────────────────────────────────────────

  const hasSession =
    request.cookies.getAll().some(c =>
      c.name.startsWith("sb-") && c.name.includes("-auth-token")
    ) ||
    !!request.cookies.get("__auth")?.value

  // /dashboard → role-specific dashboard
  if (pathname === "/dashboard") {
    const role = request.cookies.get("__role")?.value ?? "buyer"
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
  }

  const isProtected =
    pathname.startsWith("/buyer/") ||
    pathname.startsWith("/seller/") ||
    pathname.startsWith("/org/") ||
    pathname.startsWith("/admin/")

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith("/admin/")) {
    const isAdmin = request.cookies.get("__admin")?.value === "1"
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url))
    }
  }

  // ── Header injection ────────────────────────────────────────────────────────

  const response = NextResponse.next()

  const role = request.cookies.get("__role")?.value ?? "buyer"
  response.headers.set("x-active-role", role)
  response.headers.set("x-pathname", pathname)

  // ── Security headers ────────────────────────────────────────────────────────

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|og-default.png|icons|public).*)",
  ],
}
