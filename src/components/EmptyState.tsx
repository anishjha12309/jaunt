import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title: string
  body?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-hairline bg-surface px-8 py-16 text-center',
        className,
      )}
    >
      <h2 className="text-section font-semibold text-ink">{title}</h2>
      {body && <p className="mt-2 max-w-sm text-body text-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
