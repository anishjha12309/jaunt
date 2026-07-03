import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'neutral' | 'critical' | 'warn' | 'ok' | 'snoozed' | 'blue'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-ink/5 text-muted',
  critical: 'bg-critical/10 text-critical',
  warn: 'bg-warn/10 text-warn',
  ok: 'bg-ok/10 text-ok',
  snoozed: 'bg-snoozed/10 text-snoozed',
  blue: 'bg-blue/10 text-blue-ink',
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
