import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface GlassNavProps {
  /** Filled in Phase 4 with tab filters. */
  tabs?: ReactNode
  /** Filled in Phase 4 with the search trigger. */
  search?: ReactNode
  className?: string
}

export function GlassNav({ tabs, search, className }: GlassNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className={cn(
          'pointer-events-auto flex items-center gap-4 rounded-pill border border-white/50 bg-white/65 px-4 py-2',
          'shadow-[0_4px_24px_rgb(27_27_24_/_0.10)] backdrop-blur-xl',
          className,
        )}
      >
        <Wordmark />
        {tabs && <div className="flex items-center gap-1">{tabs}</div>}
        {search}
        <FailureDot />
      </nav>
    </div>
  )
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2 pr-1">
      <span aria-hidden="true" className="h-4 w-4 rounded-[5px] bg-blue" />
      <span className="text-[15px] font-semibold tracking-tight text-ink">Inbox</span>
    </span>
  )
}

function FailureDot() {
  // Gray in Phase 2; wired to the failure simulator (turns critical-red) in Phase 6.
  return (
    <span
      className="ml-1 h-2.5 w-2.5 rounded-full bg-muted/40"
      title="Failure simulator: off"
      aria-hidden="true"
    />
  )
}
