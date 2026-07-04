import { useCallback, useEffect, useRef, useState } from 'react'
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
 * to the store and its action buttons. A departed toast lingers in local `leaving` state
 * just long enough to play its CSS exit transition before it's dropped for good.
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
  const exitedRef = useRef(onExited)
  exitedRef.current = onExited

  // Reduced motion never fires a transition, so the CSS exit's onTransitionEnd never
  // runs — leave immediately instead of lingering in `leaving` state forever.
  useEffect(() => {
    if (exiting && prefersReducedMotion()) exitedRef.current()
  }, [exiting])

  return (
    <div
      onTransitionEnd={(event) => {
        if (exiting && event.propertyName === 'opacity') exitedRef.current()
      }}
      className={cn(
        'pointer-events-auto flex max-w-md items-center gap-3 rounded-chip py-2.5 pl-4 pr-2.5 text-body shadow-soft',
        'animate-[toast-in_150ms_ease-out] motion-reduce:animate-none',
        'transition-[transform,opacity] duration-150 ease-in motion-reduce:transition-none',
        exiting ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100',
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
