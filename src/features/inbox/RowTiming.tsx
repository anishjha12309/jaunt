import { cn } from '@/lib/cn'
import { formatCountdown, formatWaited, type CountdownTone } from '@/lib/time'
import { useNow } from '@/features/inbox/nowContext'

interface RowTimingProps {
  slaDueAt: string
  createdAt: string
}

const TONE_CLASS: Record<CountdownTone, string> = {
  critical: 'text-critical',
  warn: 'text-warn',
  muted: 'text-muted',
}

/**
 * The only live cell in a row — subscribes to the page 1s clock so the SLA
 * countdown ticks while the rest of the row stays static.
 *
 * The countdown (and its "Breached" flip) is intentionally NOT wrapped in an
 * aria-live region: it re-renders every second across dozens of rows, so
 * announcing it would flood a screen reader with noise. Urgency is instead
 * conveyed by the ranked position — the most urgent items sit at the top — and
 * the text stays readable on demand. The colour + pulse are purely visual
 * reinforcement, so the critical tone also carries no live announcement.
 */
export function RowTiming({ slaDueAt, createdAt }: RowTimingProps) {
  const now = useNow()
  const countdown = formatCountdown(slaDueAt, now)

  return (
    <div className="flex flex-col items-end gap-0.5 text-right">
      <span
        className={cn(
          'font-mono text-mono tabular-nums',
          TONE_CLASS[countdown.tone],
          countdown.urgent && 'motion-safe:animate-[pulse_2s_ease-in-out_infinite]',
        )}
      >
        {countdown.text}
      </span>
      <span className="font-mono text-[11px] text-muted">waited {formatWaited(createdAt, now)}</span>
    </div>
  )
}
