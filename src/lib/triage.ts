import type { Conversation, TriageAction } from '@/api/types'

/**
 * Pure state transition for a triage action. Shared by the MSW handler (server
 * truth) and the client's optimistic cache write so the two can never drift.
 * `now` and the acting agent id are parameters — no ambient Date.now()/identity.
 */
export function applyTriageAction(
  conversation: Conversation,
  action: TriageAction,
  now: number,
  currentAgentId: string,
  snoozeMinutes?: number,
): Conversation {
  switch (action) {
    case 'assign':
      return { ...conversation, assigneeId: currentAgentId }
    case 'unassign':
      return { ...conversation, assigneeId: null }
    case 'resolve':
      return { ...conversation, status: 'resolved', snoozedUntil: null }
    case 'snooze': {
      const minutes = snoozeMinutes ?? 60
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
