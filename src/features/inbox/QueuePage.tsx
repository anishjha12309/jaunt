import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { PageShell } from '@/app/PageShell'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import type { TriageAction } from '@/api/types'
import { belongsInView } from '@/lib/queueFilter'
import { applyTriageAction } from '@/lib/triage'
import { CURRENT_AGENT_ID } from '@/mocks/data'
import { ConversationList, type SnoozeTarget } from '@/features/inbox/ConversationList'
import { FilterTabs } from '@/features/inbox/FilterTabs'
import { NowProvider } from '@/features/inbox/NowProvider'
import { QueueSkeleton } from '@/features/inbox/QueueSkeleton'
import { SearchBox } from '@/features/inbox/SearchBox'
import { StatusSelect } from '@/features/inbox/StatusSelect'
import { SummaryStrip } from '@/features/inbox/SummaryStrip'
import { useQueue } from '@/features/inbox/useQueue'
import { useQueueParams } from '@/features/inbox/useQueueParams'
import { useRowExit } from '@/features/inbox/useRowExit'
import { useTriageActions } from '@/features/actions/useTriageActions'
import { undoLatest } from '@/components/toastStore'
import { useShortcuts, useShortcutsContext } from '@/features/shortcuts/shortcutsContext'
import { useSelection } from '@/features/shortcuts/useSelection'

export function QueuePage() {
  const { filters, setTab, setStatus, setQ, clear, hasActiveFilters } = useQueueParams()
  const { ranked, summary, tabCounts, isPending, isError, error, refetch } = useQueue(filters)
  const navigate = useNavigate()
  const actions = useTriageActions()
  const { setOrderedIds } = useShortcutsContext()

  const rankedIds = useMemo(() => ranked.map((r) => r.conversation.id), [ranked])
  const exit = useRowExit(rankedIds)
  const selection = useSelection(ranked.length)
  const [snoozeTarget, setSnoozeTarget] = useState<SnoozeTarget | null>(null)
  const [searchFocusToken, setSearchFocusToken] = useState(0)

  // Publish the ranked order so the detail view can move to the next/previous item.
  useEffect(() => setOrderedIds(rankedIds), [rankedIds, setOrderedIds])

  const selected = ranked[selection.index]?.conversation

  function actOnSelected(action: Extract<TriageAction, 'assign' | 'resolve'>) {
    if (!selected) return
    const now = Date.now()
    const updated = applyTriageAction(selected, action, now, CURRENT_AGENT_ID)
    const leaving = !belongsInView(updated, filters, now, CURRENT_AGENT_ID)
    if (leaving) exit.beginExit(selected.id)
    const opts = {
      onError: () => {
        if (leaving) exit.cancelExit(selected.id)
      },
    }
    if (action === 'assign') actions.assign(selected.id, opts)
    else actions.resolve(selected.id, opts)
  }

  useShortcuts({
    j: () => selection.move(1),
    k: () => selection.move(-1),
    ArrowDown: () => selection.move(1),
    ArrowUp: () => selection.move(-1),
    Enter: () => selected && navigate(`/c/${selected.id}`),
    a: () => actOnSelected('assign'),
    r: () => actOnSelected('resolve'),
    s: () => selected && setSnoozeTarget({ id: selected.id, token: Date.now() }),
    u: () => undoLatest(),
    '/': () => setSearchFocusToken(Date.now()),
    '1': () => setTab('all'),
    '2': () => setTab('mine'),
    '3': () => setTab('unassigned'),
    '4': () => setTab('breached'),
    Escape: () => clear(),
  })

  const resultCount = ranked.length

  return (
    <PageShell
      title="Escalations"
      navTabs={<FilterTabs active={filters.tab} counts={tabCounts} onSelect={setTab} />}
      navSearch={<SearchBox value={filters.q} onChange={setQ} focusToken={searchFocusToken} />}
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
          <ConversationList
            ranked={ranked}
            filters={filters}
            exit={exit}
            selectedIndex={selection.index}
            onHover={selection.select}
            snoozeTarget={snoozeTarget}
          />
        )}
      </NowProvider>
    </PageShell>
  )
}
