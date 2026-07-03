import { PageShell } from '@/app/PageShell'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { ConversationList } from '@/features/inbox/ConversationList'
import { FilterTabs } from '@/features/inbox/FilterTabs'
import { NowProvider } from '@/features/inbox/NowProvider'
import { QueueSkeleton } from '@/features/inbox/QueueSkeleton'
import { SearchBox } from '@/features/inbox/SearchBox'
import { StatusSelect } from '@/features/inbox/StatusSelect'
import { SummaryStrip } from '@/features/inbox/SummaryStrip'
import { useQueue } from '@/features/inbox/useQueue'
import { useQueueParams } from '@/features/inbox/useQueueParams'

export function QueuePage() {
  const { filters, setTab, setStatus, setQ, clear, hasActiveFilters } = useQueueParams()
  const { ranked, summary, tabCounts, isPending, isError, error, refetch } = useQueue(filters)
  const resultCount = ranked.length

  return (
    <PageShell
      title="Escalations"
      navTabs={<FilterTabs active={filters.tab} counts={tabCounts} onSelect={setTab} />}
      navSearch={<SearchBox value={filters.q} onChange={setQ} />}
      titleAside={
        <>
          {filters.q !== '' && (
            <span className="font-mono-label text-muted">
              {resultCount} result{resultCount === 1 ? '' : 's'}
            </span>
          )}
          <StatusSelect value={filters.status} onChange={setStatus} />
        </>
      }
    >
      <NowProvider>
        {summary && <SummaryStrip summary={summary} />}
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
          hasActiveFilters ? (
            <EmptyState
              title="No matches"
              body={
                filters.q !== ''
                  ? `No open conversations match "${filters.q}". Try a different search or clear your filters.`
                  : 'No conversations match these filters right now.'
              }
              action={
                <Button variant="ghost" onClick={clear}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Queue clear 🎉"
              body="Nothing needs you right now. New escalations will land here as they arrive."
            />
          )
        ) : (
          <ConversationList ranked={ranked} />
        )}
      </NowProvider>
    </PageShell>
  )
}
