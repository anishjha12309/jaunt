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
      <span className="font-mono text-[11px] text-muted/80">waited {formatWaited(createdAt, now)}</span>
    </div>
  )
}
