import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  body?: string
  action?: ReactNode
  className?: string
  /** Drop the card chrome so a backdrop can show through (queue-clear celebration). */
  bare?: boolean
}

export function EmptyState({ title, body, action, className, bare = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-8 py-16 text-center',
        !bare && 'rounded-card border border-hairline bg-surface',
        className,
      )}
    >
      <h2 className="text-section font-semibold text-ink">{title}</h2>
      {body && <p className="mt-2 max-w-sm text-body text-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
