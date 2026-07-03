import { delay, http, HttpResponse } from 'msw'
import type { Conversation, QueueResponse, QueueSummary, TabCounts, TriageRequestBody } from '@/api/types'
import { conversations as seedConversations, CURRENT_AGENT_ID } from '@/mocks/data'
import { isFailureModeEnabled, setFailureMode } from '@/mocks/failureFlag'
import { isBreached, matchesQuery, matchesStatus, matchesTab } from '@/lib/queueFilter'
import { applyTriageAction } from '@/lib/triage'

const db: Conversation[] = seedConversations

function randomDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * (500 - 200 + 1)) + 200
  return delay(ms)
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
    const items = scoped.filter((conversation) => matchesTab(conversation, tab, now, CURRENT_AGENT_ID))

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
    const updated = applyTriageAction(current, body.action, Date.now(), CURRENT_AGENT_ID, body.snoozeMinutes)
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
