import { Button } from '@/components/Button'
import type { Conversation } from '@/api/types'
import { CURRENT_AGENT_ID } from '@/mocks/data'
import { SnoozeMenu } from '@/features/actions/SnoozeMenu'
import { useTriageActions } from '@/features/actions/useTriageActions'

interface ActionBarProps {
  conversation: Conversation
  /** Bumped by the detail `s` shortcut to open the snooze menu. */
  snoozeOpenToken?: number
}

export function ActionBar({ conversation, snoozeOpenToken }: ActionBarProps) {
  const actions = useTriageActions()
  const { id, status, assigneeId } = conversation
  const busy = actions.isPending

  return (
    <div className="sticky bottom-6 mt-8 flex items-center gap-2 rounded-card border border-hairline bg-surface/90 p-3 shadow-soft backdrop-blur-sm">
      {status === 'resolved' ? (
        <Button variant="primary" disabled={busy} onClick={() => actions.reopen(id)}>
          Reopen
        </Button>
      ) : (
        <>
          {assigneeId !== CURRENT_AGENT_ID && (
            <Button variant="primary" disabled={busy} onClick={() => actions.assign(id)}>
              Assign to me
            </Button>
          )}
          <Button variant="ghost" disabled={busy} onClick={() => actions.resolve(id)}>
            Resolve
          </Button>
          <SnoozeMenu
            variant="button"
            align="left"
            disabled={busy}
            openToken={snoozeOpenToken}
            onSnooze={(minutes) => actions.snooze(id, minutes)}
          />
        </>
      )}
    </div>
  )
}
