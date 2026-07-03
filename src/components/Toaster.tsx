/**
 * Toast mount point. The container and its live region live here from Phase 2 so
 * the shell is a11y-complete; the imperative toast API (enqueue, Undo/Retry
 * actions, auto-dismiss) is wired in Phase 6 when triage actions need it.
 */
export function Toaster() {
  return (
    <div
      id="toast-region"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    />
  )
}
