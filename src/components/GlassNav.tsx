import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface GlassNavProps {
  /** Tab filters (Phase 4). */
  tabs?: ReactNode
  /** Search trigger (Phase 4). */
  search?: ReactNode
  /** Failure-simulator control (Phase 6), injected so this stays feature-agnostic. */
  failureSlot?: ReactNode
  className?: string
}

export function GlassNav({ tabs, search, failureSlot, className }: GlassNavProps) {
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
        {tabs && <span aria-hidden="true" className="h-5 w-px bg-hairline" />}
        {tabs}
        {search}
        {failureSlot}
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
