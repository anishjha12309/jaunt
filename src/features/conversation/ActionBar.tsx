import { Button } from '@/components/Button'
import { showToast } from '@/components/toastStore'
import type { ConversationStatus } from '@/api/types'

interface ActionBarProps {
  status: ConversationStatus
}

// Phase 5 renders every control live but inert: the real optimistic mutations,
// snooze menu, and undo arrive in Phase 6. Rather than disable the buttons, each
// gives honest feedback so nothing on screen is dead.
const PENDING_MESSAGE = 'Actions arrive in the next commit'

export function ActionBar({ status }: ActionBarProps) {
  const announce = () => showToast(PENDING_MESSAGE)

  return (
    <div className="sticky bottom-6 mt-8 flex items-center gap-2 rounded-card border border-hairline bg-surface/90 p-3 shadow-soft backdrop-blur-sm">
      {status === 'resolved' ? (
        <Button variant="primary" onClick={announce}>
          Reopen
        </Button>
      ) : (
        <>
          <Button variant="primary" onClick={announce}>
            Assign to me
          </Button>
          <Button variant="ghost" onClick={announce}>
            Resolve
          </Button>
          <Button variant="ghost" onClick={announce}>
            Snooze ▾
          </Button>
        </>
      )}
    </div>
  )
}
