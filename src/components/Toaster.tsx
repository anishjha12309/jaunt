import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  dismissToast,
  subscribeToasts,
  type ToastItem,
  type ToastTone,
} from '@/components/toastStore'

/**
 * Toast mount point. The `aria-live` region has been here since Phase 2 so the
 * shell is announce-ready; Phase 5 wires it to the toast store. Click a toast to
 * dismiss it early (Phase 6 adds Undo/Retry action buttons).
 */
const TONE_CLASSES: Record<ToastTone, string> = {
  neutral: 'bg-panel text-panel-text',
  success: 'bg-panel text-panel-text',
  error: 'bg-critical text-white',
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
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={cn(
            'pointer-events-auto max-w-sm rounded-chip px-4 py-2.5 text-left text-body shadow-soft',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
            TONE_CLASSES[toast.tone],
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}
