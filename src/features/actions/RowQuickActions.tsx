import { cn } from '@/lib/cn'
import type { Conversation, QueueFilters, TriageAction } from '@/api/types'
import { belongsInView } from '@/lib/queueFilter'
import { applyTriageAction } from '@/lib/triage'
import { CURRENT_AGENT_ID } from '@/mocks/data'
import { useNow } from '@/features/inbox/nowContext'
import type { RowExit } from '@/features/inbox/useRowExit'
import { ICON_BUTTON } from '@/features/actions/iconButton'
import { SnoozeMenu } from '@/features/actions/SnoozeMenu'
import { useTriageActions } from '@/features/actions/useTriageActions'

interface RowQuickActionsProps {
  conversation: Conversation
  filters: QueueFilters
  exit: RowExit
  /** Bumped by the `s` shortcut to open this row's snooze menu. */
  snoozeOpenToken?: number
  className?: string
}

/**
 * Hover/focus-revealed actions on a queue row. They sit above the row's link so a
 * click acts instead of navigating. Each action shares the detail view's optimistic
 * machinery; when it pushes the row out of the current filter, the row animates out
 * and un-collapses if the write fails.
 */
export function RowQuickActions({
  conversation,
  filters,
  exit,
  snoozeOpenToken,
  className,
}: RowQuickActionsProps) {
  const now = useNow()
  const actions = useTriageActions()
  const { id, status, assigneeId } = conversation

  // Would this action remove the row from the view the user is currently looking at?
  const wouldLeave = (action: TriageAction, minutes?: number) => {
    const updated = applyTriageAction(conversation, action, now, CURRENT_AGENT_ID, minutes)
    return !belongsInView(updated, filters, now, CURRENT_AGENT_ID)
  }

  const fire = (
    action: TriageAction,
    run: (opts: { onError: () => void }) => void,
    minutes?: number,
  ) => {
    const leaving = wouldLeave(action, minutes)
    if (leaving) exit.beginExit(id)
    run({
      onError: () => {
        if (leaving) exit.cancelExit(id)
      },
    })
  }

  return (
    <div
      className={cn(
        // Pointer-only affordance: hidden on touch, where tapping the row opens the detail view to act.
        'hidden items-center gap-0.5 rounded-full border border-hairline bg-surface px-1 py-1 shadow-soft sm:flex',
        className,
      )}
    >
      {status === 'resolved' ? (
        <button
          type="button"
          aria-label="Reopen conversation"
          disabled={actions.isPending}
          onClick={() => fire('reopen', (opts) => actions.reopen(id, opts))}
          className={ICON_BUTTON}
        >
          <ReopenIcon />
        </button>
      ) : (
        <>
          {assigneeId !== CURRENT_AGENT_ID && (
            <button
              type="button"
              aria-label="Assign to me"
              disabled={actions.isPending}
              onClick={() => fire('assign', (opts) => actions.assign(id, opts))}
              className={ICON_BUTTON}
            >
              <AssignIcon />
            </button>
          )}
          <button
            type="button"
            aria-label="Resolve conversation"
            disabled={actions.isPending}
            onClick={() => fire('resolve', (opts) => actions.resolve(id, opts))}
            className={ICON_BUTTON}
          >
            <ResolveIcon />
          </button>
          <SnoozeMenu
            align="right"
            disabled={actions.isPending}
            openToken={snoozeOpenToken}
            onSnooze={(minutes) => fire('snooze', (opts) => actions.snooze(id, minutes, opts), minutes)}
          />
        </>
      )}
    </div>
  )
}

function AssignIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 13c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 8.5v4M13 10.5h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ResolveIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReopenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8a5 5 0 105-5M3 8V4m0 4h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
