import type { Conversation } from '@/api/types'

/** Deep-mergeable Conversation fixture for tests — override only what a case cares about. */
export function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  const epoch = new Date(0).toISOString()
  return {
    id: 'conv-test',
    customer: { name: 'Test User', company: 'Acme', tier: 'growth' },
    channel: 'chat',
    subject: 'Test subject',
    status: 'open',
    assigneeId: null,
    escalation: {
      reason: 'human_requested',
      summary: 'Needs a human.',
      aiConfidence: 0.5,
      csat: null,
      sentiment: 'neutral',
    },
    messages: [],
    createdAt: epoch,
    escalatedAt: epoch,
    slaDueAt: epoch,
    snoozedUntil: null,
    ...overrides,
  }
}
