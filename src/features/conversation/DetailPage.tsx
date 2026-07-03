import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { AppFooter } from '@/app/AppFooter'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { GlassNav } from '@/components/GlassNav'
import type { Conversation } from '@/api/types'
import { CHANNEL_LABEL, STATUS_LABEL, STATUS_TONE, TIER_LABEL } from '@/lib/labels'
import { undoLatest } from '@/components/toastStore'
import { FailureToggle } from '@/features/actions/FailureToggle'
import { useTriageActions } from '@/features/actions/useTriageActions'
import { NowProvider } from '@/features/inbox/NowProvider'
import { useShortcuts, useShortcutsContext } from '@/features/shortcuts/shortcutsContext'
import { ActionBar } from '@/features/conversation/ActionBar'
import { CustomerSidebar } from '@/features/conversation/CustomerSidebar'
import { DetailSkeleton } from '@/features/conversation/DetailSkeleton'
import { HandoffCard } from '@/features/conversation/HandoffCard'
import { Transcript } from '@/features/conversation/Transcript'
import { useConversation } from '@/features/conversation/useConversation'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { conversation, isPending, isError, notFound, error, refetch } = useConversation(id)
  const actions = useTriageActions()
  const { orderedIds } = useShortcutsContext()
  const [snoozeToken, setSnoozeToken] = useState<number | undefined>(undefined)

  // Return to the queue exactly as it was (filters live in its URL) when we got
  // here in-app; fall back to a fresh queue on a cold deep-link/reload.
  const goBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate('/')
  }

  // j/k walk the ranked order the queue published — moving to the next conversation.
  const goToOffset = (delta: number) => {
    if (!id) return
    const index = orderedIds.indexOf(id)
    if (index === -1) return
    const target = orderedIds[index + delta]
    if (target) navigate(`/c/${target}`)
  }

  useShortcuts({
    Escape: goBack,
    j: () => goToOffset(1),
    ArrowDown: () => goToOffset(1),
    k: () => goToOffset(-1),
    ArrowUp: () => goToOffset(-1),
    a: () => conversation && actions.assign(conversation.id),
    r: () => conversation && actions.resolve(conversation.id),
    s: () => conversation && setSnoozeToken((token) => (token ?? 0) + 1),
    u: () => undoLatest(),
  })

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GlassNav failureSlot={<FailureToggle />} />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <button
          type="button"
          onClick={goBack}
          className="-ml-1 inline-flex items-center gap-1 rounded-chip px-1 text-body text-blue-ink transition-colors hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          ← Queue
        </button>

        <div className="mt-6">
          {!id || notFound ? (
            <EmptyState
              title="Conversation not found"
              body="It may have been resolved already, or the link is out of date."
              action={
                <Button variant="primary" onClick={() => navigate('/')}>
                  Back to queue
                </Button>
              }
            />
          ) : isPending ? (
            <DetailSkeleton />
          ) : isError ? (
            <EmptyState
              title="Couldn't load this conversation"
              body={error?.message ?? 'Something went wrong reaching the inbox.'}
              action={
                <Button variant="primary" onClick={refetch}>
                  Retry
                </Button>
              }
            />
          ) : conversation ? (
            <NowProvider>
              <LoadedDetail conversation={conversation} snoozeOpenToken={snoozeToken} />
            </NowProvider>
          ) : null}
        </div>

        <AppFooter />
      </main>
    </div>
  )
}

function LoadedDetail({
  conversation,
  snoozeOpenToken,
}: {
  conversation: Conversation
  snoozeOpenToken: number | undefined
}) {
  const { customer, channel, subject, status, escalation, messages } = conversation

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-section font-semibold tracking-tight text-ink">
            {customer.name}
          </h1>
          <p className="mt-0.5 text-body text-muted">
            {customer.company} · {CHANNEL_LABEL[channel]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={customer.tier === 'enterprise' ? 'blue' : 'neutral'}>
            {TIER_LABEL[customer.tier]}
          </Badge>
          <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
        </div>
      </header>
      <p className="mt-3 text-row-title font-medium text-ink">{subject}</p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col">
          <Transcript messages={messages} customerName={customer.name} />
          <ActionBar conversation={conversation} snoozeOpenToken={snoozeOpenToken} />
        </div>
        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-28 lg:w-80">
          <HandoffCard escalation={escalation} />
          <CustomerSidebar conversation={conversation} />
        </aside>
      </div>
    </>
  )
}
