import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import type { QueueFilters } from '@/api/types'
import { ConversationRow } from '@/features/inbox/ConversationRow'
import type { RankedConversation } from '@/features/inbox/useQueue'
import type { RowExit } from '@/features/inbox/useRowExit'
import { RowQuickActions } from '@/features/actions/RowQuickActions'

export interface SnoozeTarget {
  id: string
  token: number
}

interface ConversationListProps {
  ranked: RankedConversation[]
  filters: QueueFilters
  exit: RowExit
  selectedIndex: number
  onHover: (index: number) => void
  snoozeTarget: SnoozeTarget | null
}

export function ConversationList({
  ranked,
  filters,
  exit,
  selectedIndex,
  onHover,
  snoozeTarget,
}: ConversationListProps) {
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map())

  // Keep the keyboard-selected row on screen (mouse hover lands on visible rows, so
  // `nearest` is a no-op there). Phase 8 swaps this for lenis.scrollTo.
  const selectedId = ranked[selectedIndex]?.conversation.id
  useEffect(() => {
    if (selectedId) rowRefs.current.get(selectedId)?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  return (
    <ul className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
      {ranked.map(({ conversation, bucket }, index) => {
        if (exit.hidden.has(conversation.id)) return null
        const isExiting = exit.exiting.has(conversation.id)
        const isSelected = index === selectedIndex
        return (
          <li
            key={conversation.id}
            ref={(el) => {
              if (el) rowRefs.current.set(conversation.id, el)
              else rowRefs.current.delete(conversation.id)
            }}
            data-selected={isSelected ? '' : undefined}
            onMouseEnter={() => onHover(index)}
            className="group relative scroll-mt-28"
          >
            <div
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                isExiting ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
              )}
            >
              <div className="overflow-hidden">
                <ConversationRow conversation={conversation} bucket={bucket} selected={isSelected} />
              </div>
            </div>
            <RowQuickActions
              conversation={conversation}
              filters={filters}
              exit={exit}
              snoozeOpenToken={snoozeTarget?.id === conversation.id ? snoozeTarget.token : undefined}
              className={cn(
                'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150',
                'group-hover:pointer-events-auto group-hover:opacity-100',
                'group-focus-within:pointer-events-auto group-focus-within:opacity-100',
                'group-data-selected:pointer-events-auto group-data-selected:opacity-100',
              )}
            />
          </li>
        )
      })}
    </ul>
  )
}
