import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { useLenis } from '@/app/lenisContext'
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

// pt-28 clearance so a scrolled-to row never hides under the fixed nav pill.
const NAV_CLEARANCE = 112

export function ConversationList({
  ranked,
  filters,
  exit,
  selectedIndex,
  onHover,
  snoozeTarget,
}: ConversationListProps) {
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const lenis = useLenis()

  // Hovering must never itself scroll the page — near the top/bottom edge of the
  // viewport a partially-clipped row is still hoverable, so scrolling it into view
  // would hover the next row up/down and the page would chase the cursor forever.
  // This ref flags a selection change as hover-driven so the effect below can skip it;
  // keyboard moves and post-resolve reselection (selectedIndex changing some other way)
  // still scroll normally.
  const hoverDrivenRef = useRef(false)
  const handleHover = (index: number) => {
    if (index !== selectedIndex) hoverDrivenRef.current = true
    onHover(index)
  }

  // Keep the keyboard-selected row on screen when it's actually clipped.
  const selectedId = ranked[selectedIndex]?.conversation.id
  useEffect(() => {
    const wasHoverDriven = hoverDrivenRef.current
    hoverDrivenRef.current = false
    if (wasHoverDriven) return
    if (!selectedId) return
    const el = rowRefs.current.get(selectedId)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fullyVisible = rect.top >= NAV_CLEARANCE && rect.bottom <= window.innerHeight
    if (fullyVisible) return
    if (lenis) lenis.scrollTo(el, { offset: -NAV_CLEARANCE })
    else el.scrollIntoView({ block: 'nearest' })
  }, [selectedId, lenis])

  return (
    <ul className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
      {ranked.map(({ conversation, bucket }, index) => {
        if (exit.hidden.has(conversation.id)) return null
        const isSelected = index === selectedIndex
        const isExiting = exit.exiting.has(conversation.id)
        return (
          <li
            key={conversation.id}
            ref={(el) => {
              if (el) rowRefs.current.set(conversation.id, el)
              else rowRefs.current.delete(conversation.id)
            }}
            data-selected={isSelected ? '' : undefined}
            onMouseEnter={() => handleHover(index)}
            className="group relative scroll-mt-28"
          >
            {/* grid-rows 1fr→0fr is the CSS trick for animating to/from an intrinsic height;
                the child needs its own overflow-hidden for the row content to actually clip. */}
            <div
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-200 ease-in motion-reduce:transition-none',
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
