import Link from "next/link"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleToggle } from "@/components/shared/RoleToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/shared/utils"
import type { Session } from "@/lib/shared/types"

interface AppHeaderProps {
  variant: "marketing" | "dashboard"
  session?: Session | null
}

export async function AppHeader({ variant, session }: AppHeaderProps) {
  const isDashboard = variant === "dashboard"

  return (
    <header className="fixed top-0 left-0 right-0 z-sticky h-16 bg-surface border-b border-border flex items-center px-4 md:px-6 gap-4">
      {/* Logo */}
      <Link
        href={session ? `/${session.activeRole}/dashboard` : "/"}
        className="flex-shrink-0 text-lg font-semibold text-text-primary tracking-tight"
      >
        Freelance<span className="text-brand-500">Hub</span>
      </Link>

      {/* Search bar — marketing only on desktop */}
      {!isDashboard && (
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="search"
              placeholder="Search for any service or skill..."
              className="w-full h-10 pl-9 pr-4 text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {!session ? (
          /* Unauthenticated — marketing nav */
          <>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/gigs" className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors">
                Browse Gigs
              </Link>
              <Link href="/freelancers" className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors">
                Find Talent
              </Link>
              <Link href="/how-it-works" className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors">
                How it Works
              </Link>
            </nav>
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Log In
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              Get Started
            </Button>
          </>
        ) : (
          /* Authenticated — dashboard nav */
          <>
            {/* Role toggle */}
            <RoleToggle
              activeRole={session.activeRole}
              hasSeller={session.grantedRoles.includes("seller")}
            />

            {/* Notifications */}
            <Link
              href={`/${session.activeRole}/notifications`}
              className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt="User avatar" />
                  <AvatarFallback className="text-xs bg-brand-100 text-brand-700">
                    {getInitials(session.email)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-text-tertiary font-normal truncate">
                  {session.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/${session.activeRole}/profile`} className="w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/${session.activeRole}/settings`} className="w-full">Settings</Link>
                </DropdownMenuItem>
                {session.grantedRoles.includes("admin") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/admin/dashboard" className="w-full text-brand-600">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form action="/api/auth/logout" method="POST" className="w-full">
                    <button type="submit" className="w-full text-left text-danger-600">
                      Log Out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  )
}
