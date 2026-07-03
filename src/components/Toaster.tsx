import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/cn'
import { prefersReducedMotion } from '@/lib/reducedMotion'
import {
  dismissToast,
  subscribeToasts,
  type ToastItem,
  type ToastTone,
} from '@/components/toastStore'

/**
 * Toast mount point. The `aria-live` region has been here since Phase 2; Phase 6 wired it
 * to the store and its action buttons. Phase 8 adds a 150ms GSAP enter/exit — a departed
 * toast lingers in local `leaving` state just long enough to animate out.
 */
const TONE_CLASSES: Record<ToastTone, string> = {
  neutral: 'bg-panel text-panel-text',
  success: 'bg-panel text-panel-text',
  error: 'bg-critical text-white',
}

const ACTION_CLASSES: Record<ToastTone, string> = {
  neutral: 'text-white hover:bg-white/15',
  success: 'text-white hover:bg-white/15',
  error: 'text-white hover:bg-white/20',
}

export function Toaster() {
  const [store, setStore] = useState<ToastItem[]>([])
  const [leaving, setLeaving] = useState<ToastItem[]>([])
  const prevRef = useRef<ToastItem[]>([])

  useEffect(() => subscribeToasts(setStore), [])

  // Detect toasts the store dropped and hold them for their exit animation.
  useEffect(() => {
    const liveIds = new Set(store.map((t) => t.id))
    const gone = prevRef.current.filter((t) => !liveIds.has(t.id))
    prevRef.current = store
    if (gone.length === 0) return
    setLeaving((current) => {
      const known = new Set(current.map((t) => t.id))
      const added = gone.filter((t) => !known.has(t.id))
      return added.length > 0 ? [...current, ...added] : current
    })
  }, [store])

  const removeLeaving = useCallback((id: string) => {
    setLeaving((current) => current.filter((t) => t.id !== id))
  }, [])

  const rendered = [...store, ...leaving]

  return (
    <div
      id="toast-region"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {rendered.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          exiting={leaving.some((t) => t.id === toast.id)}
          onExited={() => removeLeaving(toast.id)}
        />
      ))}
    </div>
  )
}

function ToastCard({
  toast,
  exiting,
  onExited,
}: {
  toast: ToastItem
  exiting: boolean
  onExited: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const exitedRef = useRef(onExited)
  exitedRef.current = onExited

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(el, { y: 12, opacity: 0, duration: 0.15, ease: 'power2.out' })
    })
    return () => mm.revert()
  }, [])

  useEffect(() => {
    if (!exiting) return
    const el = ref.current
    if (!el || prefersReducedMotion()) {
      exitedRef.current()
      return
    }
    const tween = gsap.to(el, {
      y: 8,
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => exitedRef.current(),
    })
    return () => {
      tween.kill()
    }
  }, [exiting])

  return (
    <div
      ref={ref}
      className={cn(
        'pointer-events-auto flex max-w-md items-center gap-3 rounded-chip py-2.5 pl-4 pr-2.5 text-body shadow-soft',
        TONE_CLASSES[toast.tone],
      )}
    >
      <span className="flex-1">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick()
            dismissToast(toast.id)
          }}
          className={cn(
            'rounded-md px-2 py-1 text-[13px] font-semibold transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
            ACTION_CLASSES[toast.tone],
          )}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
