import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface RowExit {
  exiting: Set<string>
  hidden: Set<string>
  /** Collapse a row, then suppress it until the refetch drops it from the query. */
  beginExit: (id: string) => void
  /** Reverse an exit (a failed write) so the row springs back. */
  cancelExit: (id: string) => void
}

const EXIT_MS = 200

/**
 * Shared queue-row exit animation, driven by both the hover quick actions and the
 * keyboard shortcuts. A row an action removes from view collapses (`exiting`) then is
 * suppressed (`hidden`) until `presentIds` no longer contains it; a failed write cancels both.
 */
export function useRowExit(presentIds: readonly string[]): RowExit {
  const [exiting, setExiting] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, number>>(new Map())

  const beginExit = useCallback((id: string) => {
    setExiting((prev) => new Set(prev).add(id))
    const timer = window.setTimeout(() => {
      timers.current.delete(id)
      setExiting((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setHidden((prev) => new Set(prev).add(id))
    }, EXIT_MS)
    timers.current.set(id, timer)
  }, [])

  const cancelExit = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setExiting((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setHidden((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  useEffect(() => {
    const present = new Set(presentIds)
    setHidden((prev) => {
      const next = new Set([...prev].filter((id) => present.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [presentIds])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return useMemo(
    () => ({ exiting, hidden, beginExit, cancelExit }),
    [exiting, hidden, beginExit, cancelExit],
  )
}
