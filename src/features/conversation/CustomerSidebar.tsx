import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Conversation } from '@/api/types'
import { CHANNEL_LABEL, TIER_LABEL } from '@/lib/labels'
import { formatCountdown, formatWaited, type CountdownTone } from '@/lib/time'
import { useNow } from '@/features/inbox/nowContext'

interface CustomerSidebarProps {
  conversation: Conversation
}

const SLA_TONE: Record<CountdownTone, string> = {
  critical: 'text-critical',
  warn: 'text-warn',
  muted: 'text-ink',
}

export function CustomerSidebar({ conversation }: CustomerSidebarProps) {
  const now = useNow()
  const { customer, channel, createdAt, slaDueAt, id } = conversation
  const sla = formatCountdown(slaDueAt, now)

  return (
    <section className="rounded-card border border-hairline bg-surface p-5">
      <p className="font-mono-label text-muted">Context</p>
      <dl className="mt-3 space-y-3">
        <Field label="Tier">{TIER_LABEL[customer.tier]}</Field>
        <Field label="Channel">{CHANNEL_LABEL[channel]}</Field>
        <Field label="Waiting">{formatWaited(createdAt, now)}</Field>
        <Field label="SLA due">
          <span className={cn('font-mono tabular-nums', SLA_TONE[sla.tone])}>{sla.text}</span>
        </Field>
        <Field label="ID">
          <span className="font-mono text-[12px] text-muted">{id}</span>
        </Field>
      </dl>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-mono-label text-muted">{label}</dt>
      <dd className="text-right text-body text-ink">{children}</dd>
    </div>
  )
}
