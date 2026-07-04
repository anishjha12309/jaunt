import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/Logo'
import { useScrolled } from '@/lib/useScrolled'

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
  const scrolled = useScrolled(8)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className={cn(
          'pointer-events-auto flex items-center gap-4 rounded-pill border border-white/50 px-4 py-2',
          'backdrop-blur-xl transition-[background-color,box-shadow,backdrop-filter] duration-200',
          scrolled
            ? 'bg-white/80 shadow-[0_8px_32px_rgb(27_27_24_/_0.16)] backdrop-blur-2xl'
            : 'bg-white/65 shadow-[0_4px_24px_rgb(27_27_24_/_0.10)]',
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
      <Logo className="h-4 w-4 text-blue" />
      <span className="text-[15px] font-semibold tracking-tight text-ink">Jaunt</span>
    </span>
  )
}
