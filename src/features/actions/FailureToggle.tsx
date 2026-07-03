import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useFailureMode } from '@/features/actions/useFailureMode'
import { usePopoverDismiss } from '@/features/actions/usePopoverDismiss'

/**
 * The nav's failure-simulator control: a status dot (critical-red while failures
 * are on) that opens a small popover to toggle the mock layer. Discoverable per
 * the spec — the footer points here.
 */
export function FailureToggle() {
  const { enabled, isBusy, toggle } = useFailureMode()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  usePopoverDismiss(ref, open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Failure simulator: ${enabled ? 'on' : 'off'}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className="ml-1 grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-colors',
            enabled ? 'bg-critical' : 'bg-muted/40',
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-card border border-hairline bg-surface p-4 text-left shadow-soft">
          <p className="font-mono-label text-muted">Failure simulator</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-body text-ink">Simulate API failures</span>
            <Switch checked={enabled} disabled={isBusy} onToggle={toggle} />
          </div>
          <p className="mt-2 text-[12px] leading-snug text-muted">
            While on, write requests fail with 500 — use it to watch a triage action roll back.
          </p>
        </div>
      )}
    </div>
  )
}

function Switch({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Simulate API failures"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:opacity-50',
        checked ? 'bg-critical' : 'bg-ink/20',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-soft transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
