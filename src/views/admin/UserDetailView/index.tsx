"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import {
  ArrowLeft, Star, ShoppingBag, Package, BarChart2,
  MapPin, Calendar, CheckCircle2, Zap, Award, Pause, Play,
  ExternalLink,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DImage from "@/components/ui/d-image"
import { formatCurrency, formatNumber, formatRating, getInitials } from "@/lib/shared/utils"
import { apiClient } from "@/lib/client/axios"
import { useUserDetailQuery } from "./hooks/useUserDetailQuery"

const ROLE_BADGE: Record<string, string> = {
  buyer:  "bg-blue-50 text-blue-700 border-blue-200",
  seller: "bg-brand-50 text-brand-700 border-brand-200",
  admin:  "bg-danger-50 text-danger-700 border-danger-200",
}

const STATUS_BADGE: Record<string, string> = {
  active:  "bg-success-50 text-success-700 border-success-200",
  paused:  "bg-warning-50 text-warning-700 border-warning-200",
  draft:   "bg-surface-muted text-text-tertiary border-border",
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-tertiary font-medium">{label}</p>
        <p className="text-xl font-bold text-text-primary leading-tight">{value}</p>
      </div>
    </div>
  )
}

interface Props {
  userId: string
}

export function UserDetailView({ userId }: Props) {
  const { data, isLoading, isError } = useUserDetailQuery(userId)
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: ({ gigId, status }: { gigId: string; status: "active" | "paused" }) =>
      apiClient.patch("/api/admin/gigs", { gigId, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-user", userId] }),
  })

  function handleToggle(gigId: string, currentStatus: string) {
    const next = currentStatus === "active" ? "paused" : "active"
    toggleMutation.mutate({ gigId, status: next as "active" | "paused" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <p className="text-text-secondary">Failed to load user details.</p>
        <Button variant="outline" size="sm" render={<Link href="/admin/users" />}>
          Back to Users
        </Button>
      </div>
    )
  }

  const { profile, sellerProfile, gigs, stats } = data

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Back */}
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-text-secondary" render={<Link href="/admin/users" />}>
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </div>

      {/* Profile card */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-6 flex flex-col sm:flex-row gap-5">
        <Avatar className="h-20 w-20 ring-4 ring-brand-100 shrink-0">
          <AvatarImage src={profile.avatarUrl ?? undefined} />
          <AvatarFallback className="text-lg bg-brand-100 text-brand-700 font-bold">
            {getInitials(profile.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-text-primary leading-tight">{profile.fullName}</h1>
            {profile.roles.map(role => (
              <Badge key={role} variant="outline" className={`text-xs ${ROLE_BADGE[role] ?? ""}`}>
                {role}
              </Badge>
            ))}
            {sellerProfile?.identityVerified && (
              <span className="flex items-center gap-1 text-xs text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            )}
            {sellerProfile?.isFeatured && (
              <span className="flex items-center gap-1 text-xs text-accent-700 bg-accent-50 border border-accent-200 px-2 py-0.5 rounded-full">
                <Award className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mb-2">@{profile.username}</p>
          {sellerProfile && (
            <p className="text-sm text-brand-600 font-medium mb-2">{sellerProfile.professionalTitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
            {profile.country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {profile.country}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
          {profile.bio && (
            <p className="text-sm text-text-secondary mt-3 max-w-xl leading-relaxed line-clamp-3">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      {sellerProfile && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Package className="w-5 h-5 text-brand-500" />}   label="Total Gigs"    value={stats.gigCount} />
          <StatCard icon={<Zap className="w-5 h-5 text-success-500" />}     label="Active Gigs"   value={stats.activeGigs} />
          <StatCard icon={<ShoppingBag className="w-5 h-5 text-brand-400" />} label="Orders"      value={formatNumber(stats.totalOrders)} />
          <StatCard icon={<Star className="w-5 h-5 text-accent-500" />}     label="Avg Rating"    value={stats.avgRating > 0 ? formatRating(stats.avgRating) : "—"} />
        </div>
      )}

      {/* Gigs table */}
      {sellerProfile && gigs.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-text-primary">Gigs</h2>
            <span className="text-xs text-text-tertiary bg-surface-muted border border-border px-2 py-0.5 rounded-full ml-1">
              {gigs.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {gigs.map(gig => (
              <div key={gig.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-subtle transition-colors">
                {/* Cover */}
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-brand-50 border border-border shrink-0">
                  {gig.coverImageUrl ? (
                    <DImage src={gig.coverImageUrl} alt="" skipTransform className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-300 text-lg font-bold">
                      {gig.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate leading-tight">{gig.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-text-tertiary">
                    <span>{formatCurrency(gig.packages.startingPriceCents)} starting</span>
                    <span>{formatNumber(gig.stats.orders)} orders</span>
                    {gig.stats.reviewCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-accent-400 text-accent-400" />
                        {formatRating(gig.stats.avgRating)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_BADGE[gig.status] ?? ""}`}>
                  {gig.status}
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="View public page"
                    render={<Link href={`/gigs/${gig.slug}`} target="_blank" />}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  {(gig.status === "active" || gig.status === "paused") && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={gig.status === "active" ? "Pause gig" : "Activate gig"}
                      onClick={() => handleToggle(gig.id, gig.status)}
                    >
                      {gig.status === "active"
                        ? <Pause className="w-3.5 h-3.5 text-warning-600" />
                        : <Play  className="w-3.5 h-3.5 text-success-600" />
                      }
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buyer-only state */}
      {!sellerProfile && (
        <div className="bg-surface rounded-2xl border border-border shadow-card p-10 flex flex-col items-center text-center">
          <ShoppingBag className="w-10 h-10 text-brand-200 mb-3" />
          <p className="font-semibold text-text-primary mb-1">Buyer account</p>
          <p className="text-sm text-text-secondary">This user has not set up a seller profile.</p>
        </div>
      )}
    </div>
  )
}
