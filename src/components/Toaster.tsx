import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  dismissToast,
  subscribeToasts,
  type ToastItem,
  type ToastTone,
} from '@/components/toastStore'

/**
 * Toast mount point. The `aria-live` region has been here since Phase 2; Phase 6
 * wires it to the store and renders the Undo/Retry action buttons that make
 * optimistic writes reversible.
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
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => subscribeToasts(setItems), [])

  return (
    <div
      id="toast-region"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
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
      ))}
    </div>
  )
}
