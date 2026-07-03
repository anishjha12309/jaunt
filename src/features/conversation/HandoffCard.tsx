import { cn } from '@/lib/cn'
import type { Escalation } from '@/api/types'
import { REASON_LABEL, SENTIMENT_DOT, SENTIMENT_LABEL } from '@/lib/labels'

interface HandoffCardProps {
  escalation: Escalation
}

/**
 * The single most important read on the page: why the AI handed this off. Dark
 * panel per the design system so it reads as the system's own voice, distinct
 * from the paper transcript.
 */
export function HandoffCard({ escalation }: HandoffCardProps) {
  const { reason, summary, aiConfidence, csat, sentiment } = escalation

  return (
    <section className="rounded-card bg-panel p-5 text-panel-text">
      <p className="font-mono-label text-panel-text/55">Why this escalated</p>

      <span className="mt-3 inline-flex items-center gap-1 rounded-chip bg-white/10 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-panel-text">
        <span aria-hidden="true">⚡</span>
        {REASON_LABEL[reason]}
      </span>

      <p className="mt-3 text-body leading-relaxed text-panel-text/90">{summary}</p>

      <ConfidenceMeter value={aiConfidence} />

      <dl className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
        {csat !== null && (
          <div className="flex items-center justify-between">
            <dt className="font-mono-label text-panel-text/55">CSAT</dt>
            <dd>
              <CsatStars value={csat} />
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="font-mono-label text-panel-text/55">Sentiment</dt>
          <dd className="flex items-center gap-2 text-body text-panel-text/90">
            <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', SENTIMENT_DOT[sentiment])} />
            {SENTIMENT_LABEL[sentiment]}
          </dd>
        </div>
      </dl>
    </section>
  )
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between font-mono-label text-panel-text/55">
        <span>AI confidence</span>
        <span className="text-panel-text/90">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
        {/* Width is a computed value — the one case the design contract allows an inline style. */}
        <div className="h-full rounded-full bg-blue" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CsatStars({ value }: { value: number }) {
  const tone = value <= 2 ? 'text-critical' : value === 3 ? 'text-warn' : 'text-ok'
  return (
    <span
      className={cn('font-mono text-[13px] tracking-[0.15em]', tone)}
      aria-label={`CSAT ${value} of 5`}
    >
      <span aria-hidden="true">
        {'★'.repeat(value)}
        <span className="text-panel-text/30">{'★'.repeat(5 - value)}</span>
      </span>
    </span>
  )
}
