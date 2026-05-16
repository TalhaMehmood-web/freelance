"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Star, MapPin, Clock, ChevronRight, ExternalLink,
  Briefcase, CheckCircle2, Award, GraduationCap, Globe2,
  ShieldCheck, TrendingUp, Package2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { GigCard } from "@/components/gigs/GigCard"
import { ContactSellerButton } from "@/components/messaging/ContactSellerButton"
import DImage from "@/components/ui/d-image"
import { formatRating, formatNumber, getInitials, cn } from "@/lib/shared/utils"
import type { GigCard as GigCardType } from "@/types/gigs"
import type { FreelancerProfile, FreelancerReview } from "@/types/freelancer"

interface Props { profile: FreelancerProfile }

function StarBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-tertiary w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-400 rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-text-primary w-6 text-right">{value.toFixed(1)}</span>
    </div>
  )
}

function ReviewCard({ review }: { review: FreelancerReview }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={review.reviewerAvatarUrl ?? undefined} />
          <AvatarFallback className="text-xs bg-brand-50 text-brand-700 font-bold">
            {getInitials(review.reviewerName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{review.reviewerName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("h-3 w-3", i < review.rating ? "fill-accent-500 text-accent-500" : "text-border")}
              />
            ))}
            <span className="text-xs text-text-tertiary ml-1">
              {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
      )}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: "Communication", value: review.communicationRating },
          { label: "Quality",       value: review.qualityRating },
          { label: "Delivery",      value: review.deliveryRating },
        ].map(({ label, value }) => (
          <div key={label} className="text-center bg-surface-subtle rounded-xl py-2">
            <p className="text-xs font-bold text-text-primary">{value.toFixed(1)}</p>
            <p className="text-2xs text-text-tertiary mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FreelancerProfileView({ profile }: Props) {
  const [tab, setTab] = useState("overview")

  const availabilityConfig = {
    available:   { label: "Available",   color: "bg-success-500", text: "text-success-600"     },
    busy:        { label: "Busy",        color: "bg-accent-400",  text: "text-accent-600"      },
    on_vacation: { label: "On Vacation", color: "bg-text-tertiary", text: "text-text-tertiary" },
  }[profile.availability] ?? { label: "Available", color: "bg-success-500", text: "text-success-600" }

  const tabCount = {
    portfolio: profile.portfolio.length,
    gigs:      profile.gigs.length,
    reviews:   profile.reviews.length,
  }

  // Shape FreelancerGig into the GigCard type the shared component expects
  const gigCards: GigCardType[] = profile.gigs.map((g) => ({
    id:                 g.id,
    slug:               g.slug,
    title:              g.title,
    coverImageUrl:      g.coverImageUrl,
    images:             g.coverImageUrl ? [{ id: "cover", imageUrl: g.coverImageUrl }] : [],
    startingPriceCents: g.startingPriceCents,
    avgRating:          g.avgRating,
    reviewCount:        g.reviewCount,
    isFeatured:         false,
    category:           { name: "", slug: "" },
    seller: {
      username:    profile.username,
      fullName:    profile.fullName,
      avatarUrl:   profile.avatarUrl,
      sellerLevel: profile.sellerLevel,
      country:     profile.country,
    },
  }))

  return (
    <div className="relative min-h-screen bg-surface-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-72 h-72 rounded-full bg-brand-50/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-brand-50/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, var(--color-brand-400) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-text-tertiary mb-8">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/freelancers" className="hover:text-brand-500 transition-colors">Freelancers</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-text-secondary truncate">{profile.fullName}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
          <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-6 space-y-5">

              {/* Profile card */}
              <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
                {/* Cover gradient */}
                <div className="h-20 bg-linear-to-br from-brand-100 via-brand-50 to-surface relative">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-brand-300) 0.5px, transparent 0)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                </div>

                <div className="px-6 pb-6 -mt-10 text-center">
                  <div className="relative inline-block mb-3">
                    <Avatar className="h-20 w-20 border-4 border-surface shadow-lg">
                      <AvatarImage src={profile.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xl bg-brand-100 text-brand-700 font-bold">
                        {getInitials(profile.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn("absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface", availabilityConfig.color)} />
                  </div>

                  <h1 className="text-lg font-bold text-text-primary leading-tight">{profile.fullName}</h1>
                  <p className="text-sm text-text-secondary mt-1 leading-snug">{profile.professionalTitle}</p>

                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    <SellerLevelBadge level={profile.sellerLevel} />
                    {profile.isVerified && (
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-success-600 bg-success-50 border border-success-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>

                  {profile.totalReviews > 0 && (
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                      <span className="text-sm font-bold text-text-primary">{formatRating(profile.avgRating)}</span>
                      <span className="text-xs text-text-tertiary">({formatNumber(profile.totalReviews)} reviews)</span>
                    </div>
                  )}

                  <div className={cn("inline-flex items-center gap-1.5 mt-2 text-xs font-medium", availabilityConfig.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", availabilityConfig.color)} />
                    {availabilityConfig.label}
                  </div>

                  <Separator className="my-4" />

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                      { value: formatNumber(profile.completedOrders), label: "Orders"   },
                      { value: `~${profile.responseTimeHours}h`,      label: "Response" },
                      { value: String(profile.memberSinceYear),        label: "Member"   },
                    ].map(({ value, label }) => (
                      <div key={label} className="bg-surface-subtle rounded-xl py-2.5">
                        <p className="text-sm font-bold text-text-primary">{value}</p>
                        <p className="text-2xs text-text-tertiary mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  <ContactSellerButton sellerUserId={profile.userId} className="w-full justify-center" />
                </div>
              </div>

              {/* Details card */}
              <div className="bg-surface rounded-2xl border border-border shadow-card p-5 space-y-4">
                {profile.country && (
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <MapPin className="h-4 w-4 text-text-tertiary shrink-0" />
                    {profile.country}
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <Clock className="h-4 w-4 text-text-tertiary shrink-0" />
                  Responds in ~{profile.responseTimeHours}h
                </div>
                <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <Briefcase className="h-4 w-4 text-text-tertiary shrink-0" />
                  {formatNumber(profile.completedOrders)} completed orders
                </div>
                {profile.gigs.length > 0 && (
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <Package2 className="h-4 w-4 text-text-tertiary shrink-0" />
                    {profile.gigs.length} active gig{profile.gigs.length !== 1 ? "s" : ""}
                  </div>
                )}

                {profile.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-2xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.slice(0, 8).map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {profile.skills.length > 8 && (
                          <span className="text-xs text-text-tertiary self-center">
                            +{profile.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {profile.languages.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-2xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Languages</p>
                      <div className="space-y-1.5">
                        {profile.languages.map((lang, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Globe2 className="h-3.5 w-3.5 text-text-tertiary" />
                              <span className="text-text-primary">{lang.language}</span>
                            </div>
                            <span className="text-xs text-text-tertiary">{lang.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: TABS ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList variant="line" className="w-full mb-6 border-b border-border rounded-none bg-transparent h-auto pb-0 gap-1 flex-wrap">
                {([
                  { value: "overview",  label: "Overview",  count: undefined          },
                  { value: "gigs",      label: "Gigs",      count: tabCount.gigs      },
                  { value: "portfolio", label: "Portfolio", count: tabCount.portfolio  },
                  { value: "reviews",   label: "Reviews",   count: tabCount.reviews   },
                ] as { value: string; label: string; count: number | undefined }[]).map(({ value, label, count }) => (
                  <TabsTrigger key={value} value={value} className="text-sm font-medium">
                    {label}
                    {count != null && count > 0 && (
                      <span className="ml-1.5 text-xs bg-surface-muted px-1.5 py-0.5 rounded-full text-text-tertiary">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── OVERVIEW ───────────────────────────────────────── */}
              <TabsContent value="overview">
                <div className="space-y-5">

                  {profile.overview && (
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <h2 className="text-base font-semibold text-text-primary mb-3">About</h2>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                        {profile.overview}
                      </p>
                    </div>
                  )}

                  {/* Stats highlight row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: TrendingUp,   label: "Orders Done",   value: formatNumber(profile.completedOrders) },
                      { icon: Star,         label: "Avg Rating",    value: profile.totalReviews > 0 ? formatRating(profile.avgRating) : "—" },
                      { icon: Clock,        label: "Response Time", value: `~${profile.responseTimeHours}h` },
                      { icon: CheckCircle2, label: "Member Since",  value: String(profile.memberSinceYear) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-surface rounded-2xl border border-border shadow-card p-4 flex flex-col items-center text-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-brand-500" />
                        </div>
                        <p className="text-lg font-bold text-text-primary leading-none">{value}</p>
                        <p className="text-xs text-text-tertiary">{label}</p>
                      </div>
                    ))}
                  </div>

                  {profile.skills.length > 0 && (
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <h2 className="text-base font-semibold text-text-primary mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1 rounded-full">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.education.length > 0 && (
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-7 w-7 rounded-lg bg-brand-50 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-brand-500" />
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">Education</h2>
                      </div>
                      <div className="space-y-4">
                        {profile.education.map((edu, i) => (
                          <div key={i} className={cn("flex gap-4", i > 0 && "pt-4 border-t border-border")}>
                            <div className="h-9 w-9 rounded-xl bg-surface-subtle border border-border flex items-center justify-center shrink-0">
                              <GraduationCap className="h-4 w-4 text-text-tertiary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{edu.degree} in {edu.fieldOfStudy}</p>
                              <p className="text-sm text-text-secondary">{edu.institution}</p>
                              <p className="text-xs text-text-tertiary mt-1">{edu.from} — {edu.to ?? "Present"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.certifications.length > 0 && (
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-7 w-7 rounded-lg bg-brand-50 flex items-center justify-center">
                          <Award className="h-4 w-4 text-brand-500" />
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">Certifications</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.certifications.map((cert, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
                            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                              <Award className="h-4 w-4 text-brand-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-text-primary leading-snug">{cert.name}</p>
                              <p className="text-xs text-text-secondary">{cert.provider}</p>
                              <p className="text-xs text-text-tertiary mt-0.5">{cert.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ── GIGS ───────────────────────────────────────────── */}
              <TabsContent value="gigs">
                {gigCards.length === 0 ? (
                  <EmptyState icon={Package2} message="No active gigs yet." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {gigCards.map((gig) => (
                      <GigCard key={gig.id} gig={gig} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── PORTFOLIO ──────────────────────────────────────── */}
              <TabsContent value="portfolio">
                {profile.portfolio.length === 0 ? (
                  <EmptyState icon={Briefcase} message="No portfolio items yet." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {profile.portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow"
                      >
                        {item.imageUrl ? (
                          <div className="relative aspect-[16/10]">
                            <DImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-linear-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                            <Briefcase className="h-10 w-10 text-brand-200" />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                            {item.projectUrl && (
                              <a
                                href={item.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-text-tertiary hover:text-brand-500 transition-colors shrink-0"
                                aria-label="View project"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                          )}
                          {item.completedAt && (
                            <p className="text-xs text-text-tertiary mt-2">
                              {new Date(item.completedAt).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ── REVIEWS ────────────────────────────────────────── */}
              <TabsContent value="reviews">
                {profile.reviews.length === 0 ? (
                  <EmptyState icon={Star} message="No reviews yet." />
                ) : (
                  <div className="space-y-5">
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="text-center shrink-0">
                          <p className="text-5xl font-black text-text-primary leading-none">
                            {formatRating(profile.avgRating)}
                          </p>
                          <div className="flex items-center justify-center gap-0.5 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.round(profile.avgRating) ? "fill-accent-500 text-accent-500" : "text-border"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-text-tertiary mt-1.5">{formatNumber(profile.totalReviews)} reviews</p>
                        </div>
                        <div className="flex-1 space-y-2.5 justify-center flex flex-col">
                          {(() => {
                            const avg = (key: keyof FreelancerReview) =>
                              profile.reviews.reduce((s, r) => s + (r[key] as number), 0) / profile.reviews.length
                            return [
                              { label: "Communication", value: avg("communicationRating") },
                              { label: "Quality",       value: avg("qualityRating") },
                              { label: "Delivery",      value: avg("deliveryRating") },
                            ].map(({ label, value }) => (
                              <StarBar key={label} label={label} value={value} />
                            ))
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {profile.reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-2xl border border-border shadow-card">
      <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-brand-300" />
      </div>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  )
}
