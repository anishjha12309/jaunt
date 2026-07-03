import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { ConversationStatus, QueueFilters, QueueTab } from '@/api/types'

const TABS: readonly QueueTab[] = ['all', 'mine', 'unassigned', 'breached']
const STATUSES: readonly (ConversationStatus | 'all')[] = ['open', 'snoozed', 'resolved', 'all']

const DEFAULT_TAB: QueueTab = 'all'
const DEFAULT_STATUS: ConversationStatus | 'all' = 'open'

function coerce<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

export interface UseQueueParams {
  filters: QueueFilters
  setTab: (tab: QueueTab) => void
  setStatus: (status: ConversationStatus | 'all') => void
  setQ: (q: string) => void
  clear: () => void
  hasActiveFilters: boolean
}

export function useQueueParams(): UseQueueParams {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<QueueFilters>(
    () => ({
      tab: coerce(params.get('tab'), TABS, DEFAULT_TAB),
      status: coerce(params.get('status'), STATUSES, DEFAULT_STATUS),
      q: params.get('q') ?? '',
    }),
    [params],
  )

  // Write only non-default values so shared URLs stay clean and reload restores the exact view.
  const patch = useCallback(
    (key: string, value: string, isDefault: boolean) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (isDefault) next.delete(key)
          else next.set(key, value)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const setTab = useCallback((tab: QueueTab) => patch('tab', tab, tab === DEFAULT_TAB), [patch])
  const setStatus = useCallback(
    (status: ConversationStatus | 'all') => patch('status', status, status === DEFAULT_STATUS),
    [patch],
  )
  const setQ = useCallback((q: string) => patch('q', q, q === ''), [patch])
  const clear = useCallback(() => setParams({}, { replace: true }), [setParams])

  const hasActiveFilters =
    filters.tab !== DEFAULT_TAB || filters.status !== DEFAULT_STATUS || filters.q !== ''

  return { filters, setTab, setStatus, setQ, clear, hasActiveFilters }
}
