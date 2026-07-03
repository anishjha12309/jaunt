import { delay, http, HttpResponse } from 'msw'
import type {
  Conversation,
  QueueResponse,
  QueueSummary,
  TabCounts,
  TriageRequestBody,
} from '@/api/types'
import { conversations as seedConversations, CURRENT_AGENT_ID } from '@/mocks/data'
import { isFailureModeEnabled, setFailureMode } from '@/mocks/failureFlag'

const db: Conversation[] = seedConversations

function randomDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * (500 - 200 + 1)) + 200
  return delay(ms)
}

function isBreached(conversation: Conversation, now: number): boolean {
  return conversation.status === 'open' && new Date(conversation.slaDueAt).getTime() <= now
}

function matchesTab(conversation: Conversation, tab: string, now: number): boolean {
  switch (tab) {
    case 'mine':
      return conversation.assigneeId === CURRENT_AGENT_ID
    case 'unassigned':
      return conversation.assigneeId === null
    case 'breached':
      return isBreached(conversation, now)
    default:
      return true
  }
}

function matchesStatus(conversation: Conversation, status: string): boolean {
  if (status === 'all') return true
  return conversation.status === status
}

function matchesQuery(conversation: Conversation, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return (
    conversation.customer.name.toLowerCase().includes(needle) ||
    conversation.subject.toLowerCase().includes(needle)
  )
}

/** Counts for each tab within the current status+search filter (tab itself excluded). */
function computeTabCounts(scoped: Conversation[], now: number): TabCounts {
  return {
    all: scoped.length,
    mine: scoped.filter((c) => c.assigneeId === CURRENT_AGENT_ID).length,
    unassigned: scoped.filter((c) => c.assigneeId === null).length,
    breached: scoped.filter((c) => isBreached(c, now)).length,
  }
}

function computeSummary(now: number): QueueSummary {
  const openConversations = db.filter((c) => c.status === 'open')
  return {
    needAttention: openConversations.length,
    breached: openConversations.filter((c) => isBreached(c, now)).length,
    snoozedReturning: db.filter((c) => c.status === 'snoozed').length,
  }
}

function applyTriageAction(conversation: Conversation, body: TriageRequestBody, now: number): Conversation {
  switch (body.action) {
    case 'assign':
      return { ...conversation, assigneeId: CURRENT_AGENT_ID }
    case 'resolve':
      return { ...conversation, status: 'resolved', snoozedUntil: null }
    case 'snooze': {
      const minutes = body.snoozeMinutes ?? 60
      return {
        ...conversation,
        status: 'snoozed',
        snoozedUntil: new Date(now + minutes * 60_000).toISOString(),
      }
    }
    case 'reopen':
      return { ...conversation, status: 'open', snoozedUntil: null }
    default:
      return conversation
  }
}

export const handlers = [
  http.get('/api/conversations', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)
    const tab = url.searchParams.get('tab') ?? 'all'
    const status = url.searchParams.get('status') ?? 'open'
    const q = url.searchParams.get('q') ?? ''
    const now = Date.now()

    // Scope by status + search first so tab counts reflect the other active filters.
    const scoped = db.filter(
      (conversation) => matchesStatus(conversation, status) && matchesQuery(conversation, q),
    )
    const items = scoped.filter((conversation) => matchesTab(conversation, tab, now))

    const response: QueueResponse = {
      items,
      summary: computeSummary(now),
      tabCounts: computeTabCounts(scoped, now),
    }
    return HttpResponse.json(response)
  }),

  http.get('/api/conversations/:id', async ({ params }) => {
    await randomDelay()
    const conversation = db.find((c) => c.id === params.id)
    if (!conversation) {
      return HttpResponse.json({ message: 'Conversation not found' }, { status: 404 })
    }
    return HttpResponse.json(conversation)
  }),

  http.patch('/api/conversations/:id', async ({ params, request }) => {
    await randomDelay()

    if (isFailureModeEnabled()) {
      return HttpResponse.json({ message: 'Simulated network failure' }, { status: 500 })
    }

    const index = db.findIndex((c) => c.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Conversation not found' }, { status: 404 })
    }

    const body = (await request.json()) as TriageRequestBody
    const current = db[index] as Conversation
    const updated = applyTriageAction(current, body, Date.now())
    db[index] = updated

    return HttpResponse.json(updated)
  }),

  http.get('/api/dev/failures', async () => {
    return HttpResponse.json({ enabled: isFailureModeEnabled() })
  }),

  http.post('/api/dev/failures', async ({ request }) => {
    const body = (await request.json()) as { enabled: boolean }
    setFailureMode(body.enabled)
    return HttpResponse.json({ enabled: isFailureModeEnabled() })
  }),
]
