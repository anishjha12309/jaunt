import { useCallback, useEffect, useState } from 'react'

export interface Selection {
  index: number
  /** Set the selection directly — used when the pointer hovers a row. */
  select: (index: number) => void
  /** Move by a delta, clamped to the list bounds — used by j/k and arrows. */
  move: (delta: number) => void
}

/**
 * Tracks the highlighted row index against a list of `count` rows. Clamps when the
 * list shrinks so that, after the selected row resolves out, the selection lands on
 * whatever now occupies its slot (the next row).
 */
export function useSelection(count: number): Selection {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : Math.min(current, count - 1)))
  }, [count])

  const select = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(Math.max(0, Math.min(next, count - 1)))
    },
    [count],
  )

  const move = useCallback((delta: number) => {
    setIndex((current) => {
      if (count === 0) return 0
      return Math.max(0, Math.min(current + delta, count - 1))
    })
  }, [count])

  return { index, select, move }
}
