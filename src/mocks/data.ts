import type {
  Channel,
  Conversation,
  CustomerTier,
  EscalationReason,
  Message,
  Sentiment,
} from '@/api/types'

const SEED = 0x5eed_1234

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(SEED)

function pick<T>(items: readonly T[]): T {
  const index = Math.floor(rng() * items.length)
  return items[index] as T
}

function randomInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

const FIRST_NAMES = [
  'Priya',
  'Marcus',
  'Elena',
  'Jonah',
  'Sofia',
  'Wei',
  'Amara',
  'Liam',
  'Nadia',
  'Diego',
  'Keiko',
  'Tobias',
  'Fatima',
  'Owen',
  'Ingrid',
] as const

const LAST_NAMES = [
  'Sharma',
  'Delgado',
  'Kowalski',
  'Whitfield',
  'Novak',
  'Chen',
  'Osei',
  'Byrne',
  'Haddad',
  'Reyes',
  'Tanaka',
  'Larsen',
  'Abara',
  'Fenwick',
  'Solberg',
] as const

const COMPANIES = [
  'Northwind Logistics',
  'Brightline Health',
  'Cedarpeak Retail',
  'Voss Financial',
  'Marlowe Media',
  'Fernbank Insurance',
  'Ridgecrest Travel',
  'Loomis Telecom',
  'Auralight Energy',
  'Panorama Foods',
  'Kestrel Robotics',
  'Harborview Bank',
] as const

const TIERS: readonly CustomerTier[] = ['enterprise', 'growth', 'starter']
const CHANNELS: readonly Channel[] = ['chat', 'email', 'whatsapp']
const SENTIMENTS: readonly Sentiment[] = ['angry', 'frustrated', 'neutral', 'positive']

interface ScenarioTemplate {
  reason: EscalationReason
  subject: string
  customerLine: string
  aiLine: string
  aiSummary: string
}

const SCENARIOS: readonly ScenarioTemplate[] = [
  {
    reason: 'angry_customer',
    subject: 'Charged twice for the same order',
    customerLine:
      "This is the second time you've double-charged my card. I want a refund today, not a case number.",
    aiLine:
      "I completely understand the frustration — I can see two charges of $84.20 on your account. Let me escalate this to a specialist who can process the refund immediately.",
    aiSummary:
      'Customer was billed twice for order #48213. Refund requires manual review — beyond automated resolution scope.',
  },
  {
    reason: 'angry_customer',
    subject: 'Account locked after failed login attempts',
    customerLine:
      "I've been locked out for three days and support keeps telling me to 'wait 24 hours.' I have a business to run.",
    aiLine:
      'I hear you — three days is far too long. I\'m flagging this for immediate identity verification with a human agent.',
    aiSummary: 'Repeated lockout with no resolution across two prior AI sessions. Customer sentiment escalating.',
  },
  {
    reason: 'low_csat',
    subject: 'Shipment arrived damaged, replacement unclear',
    customerLine: "Thanks for the label, but I still don't know if I'm getting a replacement or a refund.",
    aiLine: "I've generated a return label for the damaged item. A specialist will confirm replacement timing.",
    aiSummary: 'CSAT of 2/5 after resolution. Customer left uncertain whether outcome was replacement or refund.',
  },
  {
    reason: 'low_csat',
    subject: 'Subscription downgrade lost saved preferences',
    customerLine: "My dashboard layout is gone. I spent hours setting that up.",
    aiLine: 'I can confirm your preferences were not preserved during the plan change. Escalating for data recovery.',
    aiSummary: 'Data loss on plan downgrade. Low satisfaction despite technically correct resolution steps.',
  },
  {
    reason: 'ai_low_confidence',
    subject: 'Contract renewal terms discrepancy',
    customerLine: 'The renewal quote you sent doesn\'t match what my account manager promised in March.',
    aiLine:
      "I want to make sure you get the exact terms you were promised. I'm not confident I have visibility into that agreement, so I'm looping in your account team.",
    aiSummary: 'Discrepancy between quoted renewal terms and a prior manual agreement. Outside AI knowledge scope.',
  },
  {
    reason: 'ai_low_confidence',
    subject: 'API integration returning inconsistent errors',
    customerLine: 'Your docs say this endpoint returns a 200, but we\'re seeing intermittent 502s in production.',
    aiLine:
      "This looks like it may be an infrastructure-side issue rather than a usage error. I don't have enough confidence to diagnose further — routing to engineering support.",
    aiSummary: 'Intermittent 502s reported against a documented-stable endpoint. Needs engineering-level triage.',
  },
  {
    reason: 'human_requested',
    subject: 'Requesting cancellation with no automated flow',
    customerLine: 'I want to cancel my enterprise contract. Please connect me with a person, not a bot.',
    aiLine: 'Understood — enterprise cancellations require a human agent. Connecting you now.',
    aiSummary: 'Customer explicitly requested a human agent for a contract cancellation.',
  },
  {
    reason: 'human_requested',
    subject: 'Compliance question about data residency',
    customerLine: 'Our legal team needs a written answer on EU data residency before we renew. Can I speak to someone?',
    aiLine: 'This requires a formal compliance response I\'m not authorized to provide. Connecting you with our team.',
    aiSummary: 'Legal/compliance question requiring an authorized human response.',
  },
]

const AGENT_REPLY_LINES = [
  "Thanks for your patience — I'm looking into this now.",
  "I've pulled up your account and I can see exactly what happened.",
  'Apologies for the delay here — let me make this right.',
  "I've escalated the billing team and expect an update within the hour.",
] as const

export const CURRENT_AGENT_ID = 'agent-nora-quinn'
const OTHER_AGENT_IDS = ['agent-sam-ortiz', 'agent-devon-price', 'agent-lian-wu'] as const

let messageCounter = 0
function nextMessageId(): string {
  messageCounter += 1
  return `msg-${messageCounter}`
}

function buildMessages(scenario: ScenarioTemplate, escalatedAt: number, now: number): Message[] {
  const messages: Message[] = []
  let cursor = escalatedAt - randomInt(8, 40) * 60_000

  messages.push({
    id: nextMessageId(),
    author: 'customer',
    text: scenario.customerLine,
    at: new Date(cursor).toISOString(),
  })

  cursor += randomInt(1, 4) * 60_000
  messages.push({
    id: nextMessageId(),
    author: 'ai',
    text: scenario.aiLine,
    at: new Date(cursor).toISOString(),
  })

  const extraTurns = randomInt(1, 4)
  for (let i = 0; i < extraTurns; i += 1) {
    cursor += randomInt(2, 15) * 60_000
    if (cursor >= now) break
    const author = i % 2 === 0 ? 'customer' : 'ai'
    messages.push({
      id: nextMessageId(),
      author,
      text:
        author === 'customer'
          ? "Any update? I'd appreciate knowing where this stands."
          : "I've flagged this as high priority — a human agent will follow up shortly.",
      at: new Date(cursor).toISOString(),
    })
  }

  if (cursor < now && rng() > 0.4) {
    cursor += randomInt(5, 30) * 60_000
    if (cursor < now) {
      messages.push({
        id: nextMessageId(),
        author: 'agent',
        text: pick(AGENT_REPLY_LINES),
        at: new Date(cursor).toISOString(),
      })
    }
  }

  return messages
}

interface SeedPlan {
  status: Conversation['status']
  breached: boolean
  minutesUntilSla: number
  assigned: boolean
}

function buildSeedPlan(index: number): SeedPlan {
  // First 5 are guaranteed breached, next 3 guaranteed snoozed, next 4 guaranteed resolved.
  if (index < 5) {
    return { status: 'open', breached: true, minutesUntilSla: -randomInt(5, 180), assigned: rng() > 0.5 }
  }
  if (index < 8) {
    return { status: 'snoozed', breached: false, minutesUntilSla: randomInt(30, 300), assigned: rng() > 0.3 }
  }
  if (index < 12) {
    return { status: 'resolved', breached: false, minutesUntilSla: randomInt(60, 400), assigned: true }
  }
  const breached = rng() < 0.15
  return {
    status: 'open',
    breached,
    minutesUntilSla: breached ? -randomInt(1, 120) : randomInt(5, 500),
    assigned: rng() > 0.55,
  }
}

function generateConversations(now: number): Conversation[] {
  const conversations: Conversation[] = []

  for (let i = 0; i < 42; i += 1) {
    const scenario = SCENARIOS[i % SCENARIOS.length] as ScenarioTemplate
    const plan = buildSeedPlan(i)
    const sentiment = plan.breached ? pick(['angry', 'frustrated'] as const) : pick(SENTIMENTS)
    const csat = rng() > 0.5 ? randomInt(1, 5) : null
    const waitMinutes = randomInt(3, 480)
    const createdAt = now - waitMinutes * 60_000
    const escalatedAt = createdAt + randomInt(1, Math.max(2, waitMinutes - 1)) * 60_000
    const slaDueAt = now + plan.minutesUntilSla * 60_000

    const assigneeId = plan.assigned ? pick([CURRENT_AGENT_ID, ...OTHER_AGENT_IDS]) : null
    const snoozedUntil = plan.status === 'snoozed' ? new Date(now + randomInt(15, 600) * 60_000).toISOString() : null

    conversations.push({
      id: `conv-${String(i + 1).padStart(3, '0')}`,
      customer: {
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        company: pick(COMPANIES),
        tier: TIERS[i % TIERS.length] as CustomerTier,
      },
      channel: pick(CHANNELS),
      subject: scenario.subject,
      status: plan.status,
      assigneeId,
      escalation: {
        reason: scenario.reason,
        summary: scenario.aiSummary,
        aiConfidence: Math.round(rng() * 60 + 30) / 100,
        csat,
        sentiment,
      },
      messages: buildMessages(scenario, escalatedAt, now),
      createdAt: new Date(createdAt).toISOString(),
      escalatedAt: new Date(escalatedAt).toISOString(),
      slaDueAt: new Date(slaDueAt).toISOString(),
      snoozedUntil,
    })
  }

  return conversations
}

export const conversations: Conversation[] = generateConversations(Date.now())
