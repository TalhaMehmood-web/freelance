export interface SellerSettingsData {
  displayName:         string
  professionalTitle:   string
  overview:            string
  country:             string
  payoutCurrency:      string
  maxConcurrentOrders: number
  availabilityStatus:  "available" | "busy" | "on_vacation"
  vacationAutoReply:   string
  vacationReturnDate:  string
  notifications: {
    newOrder:    boolean
    messages:    boolean
    reviews:     boolean
    promotional: boolean
  }
}

export interface AnalyticsStats {
  totalImpressions:  number
  totalClicks:       number
  ctrPercent:        number
  conversionPercent: number
}

export interface GigAnalyticsRow {
  gigId:        string
  title:        string
  impressions:  number
  clicks:       number
  ctrPercent:   number
  orders:       number
  revenueCents: number
}

export interface AnalyticsData {
  stats:        AnalyticsStats
  gigBreakdown: GigAnalyticsRow[]
}

export interface DashboardStats {
  totalEarningsCents:   number
  earningsTrendPct:     number
  activeOrders:         number
  impressionsThisMonth: number
  avgRating:            number
  reviewCount:          number
}

export interface RecentOrder {
  id:          string
  title:       string
  buyerName:   string
  buyerAvatar: string | null
  status:      string
  amountCents: number
  dueAt:       string
}

export interface TopGig {
  id:            string
  title:         string
  coverImageUrl: string | null
  totalOrders:   number
  earningsCents: number
  avgRating:     number
}

export interface DashboardData {
  stats:        DashboardStats
  recentOrders: RecentOrder[]
  topGigs:      TopGig[]
}

export interface EarningsStats {
  availableBalanceCents: number
  pendingClearanceCents: number
  totalEarnedCents:      number
  thisMonthCents:        number
}

export interface LedgerRow {
  id:          string
  type:        string
  description: string
  orderId:     string | null
  amountCents: number
  status:      string
  createdAt:   string
}

export interface SellerOrderRow {
  id:          string
  title:       string
  buyerName:   string
  buyerAvatar: string | null
  status:      string
  amountCents: number
  dueAt:       string
  createdAt:   string
}

export interface GetOrdersQuery {
  status?:  string
  search?:  string
  page?:    number
  sortBy?:  "dueAt" | "createdAt" | "amountCents"
  sortDir?: "asc" | "desc"
}

export interface OrderStatusCounts {
  active:      number
  in_revision: number
  delivered:   number
  completed:   number
  cancelled:   number
}
