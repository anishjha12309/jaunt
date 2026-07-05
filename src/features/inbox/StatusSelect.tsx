import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { ConversationStatus } from '@/api/types'
import { usePopoverDismiss } from '@/features/actions/usePopoverDismiss'

type StatusValue = ConversationStatus | 'all'

interface StatusSelectProps {
  value: StatusValue
  onChange: (status: StatusValue) => void
}

const OPTIONS: ReadonlyArray<{ value: StatusValue; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All statuses' },
]

const LABELS: Record<StatusValue, string> = {
  open: 'Open',
  snoozed: 'Snoozed',
  resolved: 'Resolved',
  all: 'All statuses',
}

/**
 * Custom listbox in place of a native <select>: the OS dropdown can't take the
 * design system's surface or motion, so the popover matches the app's other menus.
 */
export function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }
  usePopoverDismiss(containerRef, open, close)

  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, OPTIONS.findIndex((o) => o.value === value)))
  }, [open, value])
  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  function onListKeyDown(event: React.KeyboardEvent) {
    const last = OPTIONS.length - 1
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i === last ? 0 : i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i === 0 ? last : i - 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(last)
    }
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      setOpen(true)
    }
  }

  function choose(next: StatusValue) {
    onChange(next)
    close()
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <span id="status-select-label" className="font-mono-label text-muted">
        Status
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="status-select-label status-select-value"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex items-center gap-1.5 rounded-chip border border-hairline bg-surface px-2.5 py-1.5 text-mono text-ink shadow-soft',
          'transition-colors hover:bg-ink/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        )}
      >
        <span id="status-select-value">{LABELS[value]}</span>
        <ChevronIcon className={cn('text-muted transition-transform motion-reduce:transition-none', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby="status-select-label"
          onKeyDown={onListKeyDown}
          className={cn(
            'absolute right-0 top-full z-30 mt-1.5 w-40 overflow-hidden rounded-chip border border-hairline bg-surface py-1 shadow-soft',
            'animate-[popover-in_150ms_ease-out] motion-reduce:animate-none',
          )}
        >
          {OPTIONS.map((option, index) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => choose(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-body outline-none',
                  'hover:bg-ink/5 focus-visible:bg-ink/5',
                  isSelected ? 'font-medium text-ink' : 'text-ink',
                )}
              >
                {option.label}
                {isSelected && <CheckIcon />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className={className}>
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-blue">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
