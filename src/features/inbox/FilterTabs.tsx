import { cn } from '@/lib/cn'
import type { QueueTab, TabCounts } from '@/api/types'

interface FilterTabsProps {
  active: QueueTab
  counts: TabCounts | undefined
  onSelect: (tab: QueueTab) => void
}

const TABS: ReadonlyArray<{ id: QueueTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'breached', label: 'Breached' },
]

export function FilterTabs({ active, counts, onSelect }: FilterTabsProps) {
  return (
    <div role="tablist" aria-label="Queue filters" className="flex w-max items-center gap-0.5">
      {TABS.map((tab) => {
        const isActive = tab.id === active
        const count = counts?.[tab.id]
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
              isActive ? 'bg-white text-ink shadow-soft' : 'text-muted hover:text-ink',
            )}
          >
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  'font-mono text-[11px] tabular-nums',
                  isActive ? 'text-blue-ink' : 'text-muted',
                  tab.id === 'breached' && count > 0 && 'text-critical',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
