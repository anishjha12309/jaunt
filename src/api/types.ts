export type CustomerTier = 'enterprise' | 'growth' | 'starter'
export type Channel = 'chat' | 'email' | 'whatsapp'
export type ConversationStatus = 'open' | 'snoozed' | 'resolved'
export type EscalationReason =
  | 'angry_customer'
  | 'low_csat'
  | 'ai_low_confidence'
  | 'human_requested'
export type Sentiment = 'angry' | 'frustrated' | 'neutral' | 'positive'
export type MessageAuthor = 'customer' | 'ai' | 'agent'
export type TriageAction = 'assign' | 'unassign' | 'resolve' | 'snooze' | 'reopen'
export type QueueTab = 'all' | 'mine' | 'unassigned' | 'breached'

export interface Customer {
  name: string
  company: string
  tier: CustomerTier
}

export interface Escalation {
  reason: EscalationReason
  summary: string
  aiConfidence: number
  csat: number | null
  sentiment: Sentiment
}

export interface Message {
  id: string
  author: MessageAuthor
  text: string
  at: string
}

export interface Conversation {
  id: string
  customer: Customer
  channel: Channel
  subject: string
  status: ConversationStatus
  assigneeId: string | null
  escalation: Escalation
  messages: Message[]
  createdAt: string
  escalatedAt: string
  slaDueAt: string
  snoozedUntil: string | null
}

export interface QueueSummary {
  needAttention: number
  breached: number
  snoozedReturning: number
}

export type TabCounts = Record<QueueTab, number>

export interface QueueResponse {
  items: Conversation[]
  summary: QueueSummary
  tabCounts: TabCounts
}

export interface QueueFilters {
  tab: QueueTab
  status: ConversationStatus | 'all'
  q: string
}

export interface TriageRequestBody {
  action: TriageAction
  snoozeMinutes?: number
}
