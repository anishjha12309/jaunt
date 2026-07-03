/**
 * Module-level toast store. A toast is an ephemeral message with an optional
 * single action button (Undo on success, Retry on a failed write) and its own
 * auto-dismiss window. The store is UI-framework-agnostic; `Toaster` subscribes.
 */
export type ToastTone = 'neutral' | 'success' | 'error'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
  action?: ToastAction
}

export interface ToastOptions {
  tone?: ToastTone
  action?: ToastAction
  durationMs?: number
}

type Listener = (items: ToastItem[]) => void

const DEFAULT_DURATION_MS = 3000

let items: ToastItem[] = []
const listeners = new Set<Listener>()
const timers = new Map<string, number>()

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
  const timer = timers.get(id)
  if (timer !== undefined) {
    window.clearTimeout(timer)
    timers.delete(id)
  }
  items = items.filter((item) => item.id !== id)
  emit()
}

/** Fires the newest live "Undo" toast — the `u` keyboard shortcut. */
export function undoLatest(): void {
  const target = [...items].reverse().find((item) => item.action?.label === 'Undo')
  if (target?.action) {
    target.action.onClick()
    dismissToast(target.id)
  }
}

export function showToast(message: string, options: ToastOptions = {}): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  items = [...items, { id, message, tone: options.tone ?? 'neutral', action: options.action }]
  emit()

  const duration = options.durationMs ?? DEFAULT_DURATION_MS
  if (duration > 0) {
    timers.set(id, window.setTimeout(() => dismissToast(id), duration))
  }
  return id
}
