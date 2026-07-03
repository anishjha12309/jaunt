import type { Conversation, QueueFilters } from '@/api/types'

/** Open past its SLA. Snoozed/resolved conversations are never "breached". */
export function isBreached(conversation: Conversation, now: number): boolean {
  return conversation.status === 'open' && new Date(conversation.slaDueAt).getTime() <= now
}

export function matchesStatus(conversation: Conversation, status: string): boolean {
  return status === 'all' || conversation.status === status
}

export function matchesQuery(conversation: Conversation, q: string): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return (
    conversation.customer.name.toLowerCase().includes(needle) ||
    conversation.subject.toLowerCase().includes(needle)
  )
}

export function matchesTab(
  conversation: Conversation,
  tab: string,
  now: number,
  currentAgentId: string,
): boolean {
  switch (tab) {
    case 'mine':
      return conversation.assigneeId === currentAgentId
    case 'unassigned':
      return conversation.assigneeId === null
    case 'breached':
      return isBreached(conversation, now)
    default:
      return true
  }
}

/** Whether a conversation belongs in a given filtered view — used to decide, after
 * an optimistic action, whether its row should stay or animate out of that view. */
export function belongsInView(
  conversation: Conversation,
  filters: QueueFilters,
  now: number,
  currentAgentId: string,
): boolean {
  return (
    matchesStatus(conversation, filters.status) &&
    matchesQuery(conversation, filters.q) &&
    matchesTab(conversation, filters.tab, now, currentAgentId)
  )
}
