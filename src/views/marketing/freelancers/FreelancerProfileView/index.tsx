"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin, Clock, MessageCircle, ChevronRight, ExternalLink, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { SellerLevelBadge } from "@/components/freelancer/SellerLevelBadge"
import { formatCurrency, formatRating, formatNumber, getInitials } from "@/lib/shared/utils"
import type { FreelancerProfile } from "@/types/freelancer"

interface FreelancerProfileViewProps {
  profile: FreelancerProfile
}

export function FreelancerProfileView({ profile }: FreelancerProfileViewProps) {
  const [contactHovered, setContactHovered] = useState(false)

  return (
    <div className="relative min-h-screen bg-surface-subtle">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-brand-50/60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, var(--color-brand-400) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-text-tertiary mb-6">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/freelancers" className="hover:text-brand-500 transition-colors">Freelancers</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-text-secondary">{profile.fullName}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Profile card + sidebar info */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-6 space-y-5">
              {/* Main profile card */}
              <div className="bg-surface rounded-2xl border border-border shadow-card p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-2xl bg-brand-100 text-brand-700 font-bold">
                      {getInitials(profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.availability === "available" && (
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success-500 border-2 border-surface" />
                  )}
                </div>

                <h1 className="text-xl font-bold text-text-primary mb-1">{profile.fullName}</h1>
                <p className="text-sm text-text-secondary mb-2">{profile.professionalTitle}</p>

                <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                  <SellerLevelBadge level={profile.sellerLevel} />
                  {profile.isVerified && (
                    <span className="text-2xs font-semibold text-success-500 bg-success-100 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {profile.totalReviews > 0 && (
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                    <span className="text-sm font-bold text-text-primary">{formatRating(profile.avgRating)}</span>
                    <span className="text-xs text-text-tertiary">({formatNumber(profile.totalReviews)} reviews)</span>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                  <div>
                    <p className="text-base font-bold text-text-primary">{formatNumber(profile.completedOrders)}</p>
                    <p className="text-xs text-text-tertiary">Orders</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-text-primary">~{profile.responseTimeHours}h</p>
                    <p className="text-xs text-text-tertiary">Response</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-text-primary">{profile.memberSinceYear}</p>
                    <p className="text-xs text-text-tertiary">Member</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {profile.hourlyRateCents && (
                    <p className="text-lg font-bold text-text-primary">
                      {formatCurrency(profile.hourlyRateCents)}
                      <span className="text-sm font-normal text-text-tertiary">/hr</span>
                    </p>
                  )}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled
                    onMouseEnter={() => setContactHovered(true)}
                    onMouseLeave={() => setContactHovered(false)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {contactHovered ? "Coming soon" : "Contact"}
                  </Button>
                </div>
              </div>

              {/* Details card */}
              <div className="bg-surface rounded-2xl border border-border shadow-card p-5 space-y-4">
                {profile.country && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin className="h-4 w-4 text-text-tertiary shrink-0" />
                    {profile.country}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="h-4 w-4 text-text-tertiary shrink-0" />
                  Responds in ~{profile.responseTimeHours}h
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Briefcase className="h-4 w-4 text-text-tertiary shrink-0" />
                  {formatNumber(profile.completedOrders)} completed orders
                </div>

                {profile.skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {profile.languages.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Languages</p>
                      <div className="space-y-1.5">
                        {profile.languages.map((lang, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-text-primary">{lang.language}</span>
                            <span className="text-text-tertiary text-xs">{lang.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Tabs content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="overview">
              <TabsList variant="line" className="w-full mb-6 border-b border-border rounded-none bg-transparent h-auto pb-0">
                <TabsTrigger value="overview" className="text-sm font-medium">Overview</TabsTrigger>
                <TabsTrigger value="portfolio" className="text-sm font-medium">
                  Portfolio
                  {profile.portfolio.length > 0 && (
                    <span className="ml-1.5 text-xs bg-surface-muted px-1.5 py-0.5 rounded-full text-text-tertiary">
                      {profile.portfolio.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-sm font-medium">Reviews</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <div className="space-y-6">
                  {profile.overview && (
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <h2 className="text-base font-semibold text-text-primary mb-3">About</h2>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                        {profile.overview}
                      </p>
                    </div>
                  )}

                  {profile.skills.length > 0 && (
                    <div className="bg-surface rounded-2xl border border-border shadow-card p-6">
                      <h2 className="text-base font-semibold text-text-primary mb-4">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Portfolio */}
              <TabsContent value="portfolio">
                {profile.portfolio.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-surface rounded-2xl border border-border shadow-card">
                    <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                      <Briefcase className="h-7 w-7 text-brand-300" />
                    </div>
                    <p className="text-sm text-text-secondary">No portfolio items yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {profile.portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow"
                      >
                        {item.imageUrl ? (
                          <div className="relative aspect-[16/10]">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 50vw"
                            />
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-linear-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                            <Briefcase className="h-10 w-10 text-brand-300" />
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

              {/* Reviews */}
              <TabsContent value="reviews">
                <div className="flex flex-col items-center justify-center py-16 text-center bg-surface rounded-2xl border border-border shadow-card">
                  <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                    <Star className="h-7 w-7 text-brand-300" />
                  </div>
                  <p className="text-sm text-text-secondary">Reviews coming in Phase 4.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
