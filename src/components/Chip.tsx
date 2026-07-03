import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ChipTone = 'neutral' | 'critical' | 'warn' | 'ok' | 'blue'

interface ChipProps {
  tone?: ChipTone
  lightning?: boolean
  children: ReactNode
  className?: string
}

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: 'bg-ink/5 text-muted',
  critical: 'bg-critical/10 text-critical',
  warn: 'bg-warn/10 text-warn',
  ok: 'bg-ok/10 text-ok',
  blue: 'bg-blue/10 text-blue-ink',
}

export function Chip({ tone = 'neutral', lightning = false, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-chip px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em]',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {lightning && <span aria-hidden="true">⚡</span>}
      {children}
    </span>
  )
}
