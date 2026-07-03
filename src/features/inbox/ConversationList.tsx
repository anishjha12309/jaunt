import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { QueueFilters } from '@/api/types'
import { ConversationRow } from '@/features/inbox/ConversationRow'
import type { RankedConversation } from '@/features/inbox/useQueue'
import { RowQuickActions } from '@/features/actions/RowQuickActions'

interface ConversationListProps {
  ranked: RankedConversation[]
  filters: QueueFilters
}

const EXIT_MS = 200

export function ConversationList({ ranked, filters }: ConversationListProps) {
  // A row that an action pushes out of the current view collapses (exiting) then is
  // suppressed (hidden) until the refetch drops it from `ranked`. A failed write
  // cancels both so the row springs back.
  const [exiting, setExiting] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, number>>(new Map())

  const beginExit = useCallback((id: string) => {
    setExiting((prev) => new Set(prev).add(id))
    const timer = window.setTimeout(() => {
      timers.current.delete(id)
      setExiting((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setHidden((prev) => new Set(prev).add(id))
    }, EXIT_MS)
    timers.current.set(id, timer)
  }, [])

  const cancelExit = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setExiting((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setHidden((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Once the server confirms a row is gone, forget it so the sets don't grow.
  useEffect(() => {
    const present = new Set(ranked.map((r) => r.conversation.id))
    setHidden((prev) => {
      const next = new Set([...prev].filter((id) => present.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [ranked])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return (
    <ul className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
      {ranked.map(({ conversation, bucket }) => {
        if (hidden.has(conversation.id)) return null
        const isExiting = exiting.has(conversation.id)
        return (
          <li key={conversation.id} className="group relative">
            <div
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                isExiting ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
              )}
            >
              <div className="overflow-hidden">
                <ConversationRow conversation={conversation} bucket={bucket} />
              </div>
            </div>
            <RowQuickActions
              conversation={conversation}
              filters={filters}
              onBeginExit={beginExit}
              onCancelExit={cancelExit}
              className={cn(
                'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150',
                'group-hover:pointer-events-auto group-hover:opacity-100',
                'group-focus-within:pointer-events-auto group-focus-within:opacity-100',
              )}
            />
          </li>
        )
      })}
    </ul>
  )
}
