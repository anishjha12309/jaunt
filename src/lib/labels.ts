import type {
  Channel,
  ConversationStatus,
  CustomerTier,
  EscalationReason,
  Sentiment,
} from '@/api/types'

type Tone = 'neutral' | 'critical' | 'warn' | 'ok' | 'blue'
type BadgeTone = Tone | 'snoozed'

export const REASON_LABEL: Record<EscalationReason, string> = {
  angry_customer: 'Angry customer',
  low_csat: 'Low CSAT',
  ai_low_confidence: 'AI low confidence',
  human_requested: 'Human requested',
}

export const REASON_TONE: Record<EscalationReason, Tone> = {
  angry_customer: 'critical',
  low_csat: 'warn',
  ai_low_confidence: 'blue',
  human_requested: 'neutral',
}

export const TIER_LABEL: Record<CustomerTier, string> = {
  enterprise: 'Enterprise',
  growth: 'Growth',
  starter: 'Starter',
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  chat: 'Live chat',
  email: 'Email',
  whatsapp: 'WhatsApp',
}

export const SENTIMENT_LABEL: Record<Sentiment, string> = {
  angry: 'Angry',
  frustrated: 'Frustrated',
  neutral: 'Neutral',
  positive: 'Positive',
}

export const SENTIMENT_DOT: Record<Sentiment, string> = {
  angry: 'bg-critical',
  frustrated: 'bg-warn',
  neutral: 'bg-muted',
  positive: 'bg-ok',
}

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  open: 'Open',
  snoozed: 'Snoozed',
  resolved: 'Resolved',
}

export const STATUS_TONE: Record<ConversationStatus, BadgeTone> = {
  open: 'blue',
  snoozed: 'snoozed',
  resolved: 'ok',
}
