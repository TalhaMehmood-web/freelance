export interface CreateOrderInput {
  gigId:        string
  packageId:    string
  requirements: string
}

export interface OrderCreatedResponse {
  orderId: string
}

export interface OrderDeliveryItem {
  id:          string
  message:     string | null
  attachments: string[]
  createdAt:   string
}

export interface OrderDetail {
  id:                    string
  title:                 string
  description:           string | null
  requirements:          string | null
  status:                string
  priceCents:            number
  platformFeeCents:      number
  freelancerPayoutCents: number
  deliveryDays:          number
  revisionsAllowed:      number
  revisionsUsed:         number
  dueAt:                 string | null
  startedAt:             string | null
  deliveredAt:           string | null
  completedAt:           string | null
  cancelledAt:           string | null
  createdAt:             string
  buyer: {
    userId:    string
    fullName:  string
    avatarUrl: string | null
    username:  string
  }
  gig:             { title: string; slug: string } | null
  deliveries:      OrderDeliveryItem[]
  conversationId:  string | null
}
