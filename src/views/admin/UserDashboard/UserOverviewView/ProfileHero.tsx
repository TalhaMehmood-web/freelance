import Link from "next/link"
import { MapPin, Calendar, ArrowLeft, CheckCircle2, Award, ShieldX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/shared/utils"

const ROLE_BADGE: Record<string, string> = {
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  seller: "bg-brand-50 text-brand-700 border-brand-200",
  admin:  "bg-danger-50 text-danger-700 border-danger-200",
}

interface Props {
  profile: {
    userId:    string
    fullName:  string
    username:  string
    avatarUrl: string | null
    roles:     string[]
    country:   string | null
    createdAt: string
    bio:       string | null
    isBlocked: boolean
    blockedAt: string | null
  }
  sellerProfile: {
    displayName:       string
    professionalTitle: string
    sellerLevel:       string
    isFeatured:        boolean
    identityVerified:  boolean
  } | null
}

export function ProfileHero({ profile, sellerProfile }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-brand-600 transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Users
      </Link>

      {/* Blocked banner */}
      {profile.isBlocked && (
        <div className="relative overflow-hidden flex items-center gap-3 bg-linear-to-r from-danger-50 to-danger-100/60 border border-danger-200 rounded-2xl px-5 py-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-danger-200/30 to-transparent pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-danger-100 border border-danger-200 flex items-center justify-center shrink-0">
            <ShieldX className="w-5 h-5 text-danger-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-danger-700">Account Suspended</p>
            {profile.blockedAt && (
              <p className="text-xs text-danger-600 mt-0.5">
                Blocked on {new Date(profile.blockedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero card */}
      <div className="relative overflow-hidden bg-surface rounded-3xl border border-border shadow-card">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-50/80 via-surface to-surface pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-brand-200/40 blur-xl scale-110" />
              <Avatar className="relative h-24 w-24 ring-4 ring-brand-100 rounded-2xl shadow-elevated">
                <AvatarImage src={profile.avatarUrl ?? undefined} className="rounded-2xl" />
                <AvatarFallback className="text-2xl bg-linear-to-br from-brand-100 to-brand-200 text-brand-700 font-bold rounded-2xl">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + badges */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-text-primary">{profile.fullName}</h1>
                {profile.roles.map(role => (
                  <Badge key={role} variant="outline" className={`text-xs capitalize ${ROLE_BADGE[role] ?? ""}`}>
                    {role}
                  </Badge>
                ))}
              </div>

              {/* Username + title */}
              <p className="text-sm text-text-tertiary mb-2">@{profile.username}</p>
              {sellerProfile?.professionalTitle && (
                <p className="text-sm font-semibold text-brand-600 mb-3">{sellerProfile.professionalTitle}</p>
              )}

              {/* Chips row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {sellerProfile?.identityVerified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-700 bg-success-50 border border-success-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
                  </span>
                )}
                {sellerProfile?.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-700 bg-accent-50 border border-accent-200 px-2.5 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" /> Featured Seller
                  </span>
                )}
                {sellerProfile?.sellerLevel && sellerProfile.sellerLevel !== "none" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full capitalize">
                    {sellerProfile.sellerLevel.replace("_", " ")}
                  </span>
                )}
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-3">
                {profile.country && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface-subtle border border-border px-3 py-1.5 rounded-full">
                    <MapPin className="w-3 h-3 text-brand-400" /> {profile.country}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface-subtle border border-border px-3 py-1.5 rounded-full">
                  <Calendar className="w-3 h-3 text-brand-400" />
                  Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-5 pl-5 border-l-2 border-brand-200">
              <p className="text-sm text-text-secondary leading-relaxed italic line-clamp-3">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
