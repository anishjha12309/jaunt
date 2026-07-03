import { useRef } from 'react'
import { cn } from '@/lib/cn'
import { useCountUp } from '@/lib/motion'
import type { QueueSummary } from '@/api/types'

interface SummaryStripProps {
  summary: QueueSummary | undefined
}

export function SummaryStrip({ summary }: SummaryStripProps) {
  return (
    <dl className="mb-6 flex flex-wrap items-end gap-x-10 gap-y-4">
      <Stat label="Need attention" value={summary?.needAttention} />
      <Stat label="Breached" value={summary?.breached} critical />
      <Stat label="Snoozed returning" value={summary?.snoozedReturning} />
    </dl>
  )
}

function Stat({ label, value, critical = false }: { label: string; value?: number; critical?: boolean }) {
  const valueRef = useRef<HTMLElement>(null)
  useCountUp(valueRef, value)

  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="font-mono-label text-muted">{label}</dt>
      <dd
        ref={valueRef}
        className={cn(
          'font-mono text-[28px] font-medium leading-none tabular-nums',
          critical && value ? 'text-critical' : 'text-ink',
        )}
      >
        {value ?? '—'}
      </dd>
    </div>
  )
}
