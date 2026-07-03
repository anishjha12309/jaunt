import type { Conversation, CustomerTier, Sentiment } from '@/api/types'

export type Bucket = 'critical' | 'high' | 'medium' | 'low'

const SENTIMENT_WEIGHT: Record<Sentiment, number> = {
  angry: 1,
  frustrated: 0.7,
  neutral: 0.3,
  positive: 0,
}

const TIER_WEIGHT: Record<CustomerTier, number> = {
  enterprise: 1,
  growth: 0.5,
  starter: 0.2,
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function slaUrgency(slaDueAt: string, now: number): number {
  const minutesLeft = (new Date(slaDueAt).getTime() - now) / 60_000
  if (minutesLeft <= 0) return 1
  return 1 - clamp01(minutesLeft / 120)
}

function csatRisk(csat: number | null): number {
  if (csat === null) return 0
  if (csat <= 2) return 1
  if (csat === 3) return 0.5
  return 0
}

function waitTime(createdAt: string, now: number): number {
  const minutesWaiting = (now - new Date(createdAt).getTime()) / 60_000
  return clamp01(minutesWaiting / 240)
}

/**
 * Breach dominance is intentional: a breached SLA contributes the full 40pt
 * term regardless of how long ago it breached, so a stale breach never sinks
 * below a conversation that is merely trending toward one.
 */
export function scoreConversation(conversation: Conversation, now: number): number {
  const { escalation, slaDueAt, createdAt, customer } = conversation

  const slaTerm = 40 * slaUrgency(slaDueAt, now)
  const sentimentTerm = 25 * SENTIMENT_WEIGHT[escalation.sentiment]
  const csatTerm = 15 * csatRisk(escalation.csat)
  const tierTerm = 10 * TIER_WEIGHT[customer.tier]
  const waitTerm = 10 * waitTime(createdAt, now)

  return slaTerm + sentimentTerm + csatTerm + tierTerm + waitTerm
}

export function bucketFor(score: number): Bucket {
  if (score >= 70) return 'critical'
  if (score >= 45) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}
