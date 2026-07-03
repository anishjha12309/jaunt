import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { ICON_BUTTON } from '@/features/actions/iconButton'
import { usePopoverDismiss } from '@/features/actions/usePopoverDismiss'

interface SnoozeMenuProps {
  onSnooze: (minutes: number) => void
  variant?: 'icon' | 'button'
  align?: 'left' | 'right'
  disabled?: boolean
}

interface SnoozeOption {
  label: string
  minutes: number
}

function minutesUntilTomorrow9am(from: Date): number {
  const target = new Date(from)
  target.setDate(target.getDate() + 1)
  target.setHours(9, 0, 0, 0)
  return Math.max(1, Math.round((target.getTime() - from.getTime()) / 60_000))
}

export function SnoozeMenu({ onSnooze, variant = 'icon', align = 'right', disabled }: SnoozeMenuProps) {
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

  // Computed each render so "Tomorrow 9 AM" is always relative to the current time.
  const options: SnoozeOption[] = [
    { label: '15 minutes', minutes: 15 },
    { label: '1 hour', minutes: 60 },
    { label: 'Tomorrow 9 AM', minutes: minutesUntilTomorrow9am(new Date()) },
  ]

  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [open])
  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  function onMenuKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1
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

  function choose(minutes: number) {
    onSnooze(minutes)
    close(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={variant === 'icon' ? 'Snooze' : undefined}
        onClick={() => setOpen((v) => !v)}
        className={
          variant === 'icon'
            ? ICON_BUTTON
            : cn(
                'inline-flex h-10 items-center gap-1.5 rounded-chip px-4 text-body font-medium text-ink transition-colors',
                'hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
                'disabled:cursor-not-allowed disabled:text-muted',
              )
        }
      >
        {variant === 'icon' ? <ClockIcon /> : <>Snooze ▾</>}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Snooze for"
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute z-30 mt-1 w-44 overflow-hidden rounded-chip border border-hairline bg-surface py-1 shadow-soft',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((option, index) => (
            <button
              key={option.minutes}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              type="button"
              role="menuitem"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => choose(option.minutes)}
              onMouseEnter={() => setActiveIndex(index)}
              className="flex w-full items-center px-3 py-2 text-left text-body text-ink outline-none hover:bg-ink/5 focus-visible:bg-ink/5"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
