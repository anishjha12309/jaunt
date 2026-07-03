import { PageShell } from '@/app/PageShell'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import type { QueueFilters } from '@/api/types'
import { ConversationList } from '@/features/inbox/ConversationList'
import { NowProvider } from '@/features/inbox/NowProvider'
import { QueueSkeleton } from '@/features/inbox/QueueSkeleton'
import { useQueue } from '@/features/inbox/useQueue'

// Phase 4 replaces this fixed filter with URL-param state (product default: status 'open').
const PHASE3_FILTERS: QueueFilters = { tab: 'all', status: 'all', q: '' }

export function QueuePage() {
  const { ranked, isPending, isError, error, refetch } = useQueue(PHASE3_FILTERS)

  return (
    <PageShell title="Escalations">
      <NowProvider>
        {isPending ? (
          <QueueSkeleton />
        ) : isError ? (
          <EmptyState
            title="Couldn't load the queue"
            body={error?.message ?? 'Something went wrong reaching the inbox.'}
            action={
              <Button variant="primary" onClick={refetch}>
                Retry
              </Button>
            }
          />
        ) : ranked.length === 0 ? (
          <EmptyState
            title="Queue clear 🎉"
            body="Nothing needs you right now. New escalations will land here as they arrive."
          />
        ) : (
          <ConversationList ranked={ranked} />
        )}
      </NowProvider>
    </PageShell>
  )
}
