"use client"

import Link from "next/link"
import {
  DollarSign, ShoppingBag, Eye, Star,
  Plus, BarChart2, UserCircle, ArrowUpRight, TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber, formatRelativeTime, getInitials } from "@/lib/shared/utils"
import type { DashboardData } from "@/actions/seller/dashboard"

const STATUS_BADGE: Record<string, string> = {
  active:      "bg-blue-50 text-blue-700 border-blue-200",
  in_revision: "bg-yellow-50 text-yellow-700 border-yellow-200",
  delivered:   "bg-purple-50 text-purple-700 border-purple-200",
  completed:   "bg-green-50 text-green-700 border-green-200",
  cancelled:   "bg-danger-50 text-danger-700 border-danger-200",
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active", in_revision: "In Revision", delivered: "Delivered",
  completed: "Completed", cancelled: "Cancelled",
}

interface DashboardViewProps {
  data: DashboardData
}

export function SellerDashboardView({ data }: DashboardViewProps) {
  const { stats, recentOrders, topGigs } = data

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Welcome back — here's your overview</p>
        </div>
        <Button size="sm" render={<Link href="/seller/gigs/new" />}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Gig
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earnings",
            value: formatCurrency(stats.totalEarningsCents),
            sub: `+${stats.earningsTrendPct}% this month`,
            icon: DollarSign,
            accent: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Active Orders",
            value: String(stats.activeOrders),
            sub: "in progress",
            icon: ShoppingBag,
            accent: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Impressions",
            value: formatNumber(stats.impressionsThisMonth),
            sub: "this month",
            icon: Eye,
            accent: "text-brand-600",
            bg: "bg-brand-50",
          },
          {
            label: "Avg Rating",
            value: `★ ${stats.avgRating.toFixed(1)}`,
            sub: `${stats.reviewCount} reviews`,
            icon: Star,
            accent: "text-yellow-600",
            bg: "bg-yellow-50",
          },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-2xl border border-border shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{stat.label}</span>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.accent}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-tertiary mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders — takes 2 cols */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-text-primary">Recent Orders</h2>
            <Button variant="ghost" size="sm" render={<Link href="/seller/orders" />}>
              View all
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-subtle transition-colors">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-700">{getInitials(order.buyerName)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{order.title}</p>
                  <p className="text-xs text-text-tertiary">{order.buyerName} · due {formatRelativeTime(order.dueAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-xs ${STATUS_BADGE[order.status] ?? ""}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </Badge>
                  <span className="text-sm font-semibold text-text-primary">{formatCurrency(order.amountCents)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Top Gigs */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-text-primary">Top Gigs</h2>
              <Button variant="ghost" size="sm" render={<Link href="/seller/gigs" />}>
                View all
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {topGigs.map((gig, i) => (
                <div key={gig.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-subtle transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-brand-50 to-brand-100 flex items-center justify-center text-xs font-bold text-brand-600 shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{gig.title}</p>
                    <p className="text-xs text-text-tertiary">
                      {gig.totalOrders} orders · {gig.totalOrders > 0 ? formatCurrency(gig.earningsCents) : "No earnings yet"}
                    </p>
                  </div>
                  {gig.avgRating > 0 && (
                    <span className="text-xs font-semibold text-yellow-600 shrink-0">★ {gig.avgRating}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface rounded-2xl border border-border shadow-card p-5">
            <h2 className="font-semibold text-text-primary mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start" render={<Link href="/seller/gigs/new" />}>
                <Plus className="w-4 h-4 mr-2 text-brand-500" />
                Create New Gig
              </Button>
              <Button variant="outline" className="justify-start" render={<Link href="/seller/analytics" />}>
                <BarChart2 className="w-4 h-4 mr-2 text-brand-500" />
                View Analytics
              </Button>
              <Button variant="outline" className="justify-start" render={<Link href="/seller/settings" />}>
                <UserCircle className="w-4 h-4 mr-2 text-brand-500" />
                Edit Profile
              </Button>
              <Button variant="outline" className="justify-start" render={<Link href="/seller/earnings" />}>
                <TrendingUp className="w-4 h-4 mr-2 text-brand-500" />
                View Earnings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
