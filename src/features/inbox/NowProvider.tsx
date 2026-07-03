import { useEffect, useState, type ReactNode } from 'react'
import { NowContext } from '@/features/inbox/nowContext'

/**
 * Single page-level 1s clock. One interval feeds every live element (SLA
 * countdowns, waited times) instead of each row owning its own timer.
 */
export function NowProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return <NowContext.Provider value={now}>{children}</NowContext.Provider>
}
