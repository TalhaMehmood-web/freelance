export type ConversationType = "direct" | "order" | "support"

export interface MessageSender {
  userId:    string
  username:  string
  fullName:  string
  avatarUrl: string | null
}

export interface ChatMessage {
  id:             string
  conversationId: string
  senderId:       string
  content:        string
  attachments:    string[]
  type:           string
  isRead:         boolean
  createdAt:      string
  sender:         MessageSender
}

export interface ConversationParticipant {
  userId:     string
  username:   string
  fullName:   string
  avatarUrl:  string | null
  lastReadAt: string | null
}

export interface ConversationListItem {
  id:             string
  type:           ConversationType
  orderId:        string | null
  orderTitle:     string | null
  lastMessageAt:  string | null
  lastMessage:    string | null
  unreadCount:    number
  participants:   ConversationParticipant[]
  createdAt:      string
}

export interface ConversationDetail extends ConversationListItem {
  messages: ChatMessage[]
  nextCursor: string | null
}

export interface SendMessageInput {
  content:     string
  attachments?: string[]
}

export interface CreateConversationInput {
  type:          ConversationType
  participantId: string          // the other user's userId
  orderId?:      string          // required when type = "order"
  initialMessage?: string
}
