import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/cn'
import { useLenis } from '@/app/lenisContext'
import { useStaggerIn } from '@/lib/motion'
import { prefersReducedMotion } from '@/lib/reducedMotion'
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
  const listRef = useRef<HTMLUListElement>(null)
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const collapseRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const collapsing = useRef<Set<string>>(new Set())
  const lenis = useLenis()

  useStaggerIn(listRef)

  // GSAP resolve-collapse (replaces the CSS grid transition): a row entering `exiting`
  // shrinks to nothing; one cancelled before it unmounts springs back open.
  useEffect(() => {
    const reduce = prefersReducedMotion()
    for (const id of exit.exiting) {
      if (collapsing.current.has(id)) continue
      collapsing.current.add(id)
      const el = collapseRefs.current.get(id)
      if (el) gsap.to(el, { height: 0, opacity: 0, duration: reduce ? 0 : 0.2, ease: 'power2.in' })
    }
    for (const id of [...collapsing.current]) {
      if (exit.exiting.has(id)) continue
      collapsing.current.delete(id)
      const el = collapseRefs.current.get(id)
      if (el) gsap.to(el, { height: 'auto', opacity: 1, duration: reduce ? 0 : 0.2, ease: 'power2.out' })
    }
  }, [exit.exiting])

  // Keep the keyboard-selected row on screen. Hover lands on already-visible rows, so we
  // only scroll when the row is actually clipped — otherwise hovering would jump the page.
  const selectedId = ranked[selectedIndex]?.conversation.id
  useEffect(() => {
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
    <ul ref={listRef} className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
      {ranked.map(({ conversation, bucket }, index) => {
        if (exit.hidden.has(conversation.id)) return null
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
              ref={(el) => {
                if (el) collapseRefs.current.set(conversation.id, el)
                else collapseRefs.current.delete(conversation.id)
              }}
              className="overflow-hidden"
            >
              <ConversationRow conversation={conversation} bucket={bucket} selected={isSelected} />
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
