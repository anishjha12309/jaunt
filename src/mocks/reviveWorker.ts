let reviving: Promise<boolean> | null = null

// Browsers terminate idle service workers; the restarted worker loses its in-memory
// record of which tabs opted into mocking, so it silently passes /api requests through
// to the host. Re-running worker.start() re-registers this tab so the next request is
// intercepted again. Deduped: several stale queries usually notice the bypass at once.
export function reviveMockWorker(): Promise<boolean> {
  reviving ??= revive().finally(() => {
    reviving = null
  })
  return reviving
}

async function revive(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false
  const { worker } = await import('@/mocks/browser')
  // stop() first: msw treats a second start() on a started worker as redundant and
  // skips the activation handshake — the whole point of reviving.
  worker.stop()
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  return true
}
