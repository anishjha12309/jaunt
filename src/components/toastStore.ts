/**
 * Minimal module-level toast store. Phase 5 only needs an ephemeral text toast
 * (the detail action bar's "wired next" feedback); Phase 6 extends this with
 * Undo/Retry action buttons and the optimistic-rollback flows.
 */
export type ToastTone = 'neutral' | 'success' | 'error'

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}

type Listener = (items: ToastItem[]) => void

const DEFAULT_DURATION_MS = 3000

let items: ToastItem[] = []
const listeners = new Set<Listener>()

function emit(): void {
  for (const listener of listeners) listener(items)
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener)
  listener(items)
  return () => {
    listeners.delete(listener)
  }
}

export function dismissToast(id: string): void {
  items = items.filter((item) => item.id !== id)
  emit()
}

export function showToast(message: string, tone: ToastTone = 'neutral'): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  items = [...items, { id, message, tone }]
  emit()
  window.setTimeout(() => dismissToast(id), DEFAULT_DURATION_MS)
  return id
}
