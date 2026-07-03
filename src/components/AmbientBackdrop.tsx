import { lazy, Suspense } from 'react'
import { cn } from '@/lib/cn'
import { SilentErrorBoundary } from '@/components/SilentErrorBoundary'
import { useReducedMotion } from '@/lib/reducedMotion'

const AmbientScene = lazy(() => import('@/components/AmbientScene'))

/**
 * Decorative layer for the summary strip and the queue-clear state. A static radial-gradient
 * is always painted as the base — it stands in while the three.js chunk lazy-loads and is the
 * complete visual under reduced motion, where the scene never mounts.
 */
export function AmbientBackdrop({ className }: { className?: string }) {
  const reduced = useReducedMotion()

  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_40%,color-mix(in_srgb,#1d40f0_9%,transparent),transparent_72%)]" />
      {!reduced && (
        <SilentErrorBoundary>
          <Suspense fallback={null}>
            <AmbientScene />
          </Suspense>
        </SilentErrorBoundary>
      )}
    </div>
  )
}
