import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import type {
  Conversation,
  QueueFilters,
  QueueResponse,
  QueueSummary,
  TabCounts,
} from '@/api/types'
import { bucketFor, scoreConversation, type Bucket } from '@/lib/priority'

const RANK_TICK_MS = 30_000

export interface RankedConversation {
  conversation: Conversation
  score: number
  bucket: Bucket
}

export interface UseQueueResult {
  ranked: RankedConversation[]
  summary: QueueSummary | undefined
  tabCounts: TabCounts | undefined
  isPending: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  isFetching: boolean
}

function buildQueryString(filters: QueueFilters): string {
  const params = new URLSearchParams({ tab: filters.tab, status: filters.status })
  if (filters.q) params.set('q', filters.q)
  return params.toString()
}

function rank(items: Conversation[], now: number): RankedConversation[] {
  return items
    .map((conversation) => {
      const score = scoreConversation(conversation, now)
      return { conversation, score, bucket: bucketFor(score) }
    })
    .sort((a, b) => {
      // Resolved conversations always sink beneath live ones, then by score desc.
      const aResolved = a.conversation.status === 'resolved' ? 1 : 0
      const bResolved = b.conversation.status === 'resolved' ? 1 : 0
      if (aResolved !== bResolved) return aResolved - bResolved
      return b.score - a.score
    })
}

export function useQueue(filters: QueueFilters): UseQueueResult {
  const query = useQuery({
    queryKey: queryKeys.conversations(filters),
    queryFn: () => apiGet<QueueResponse>(`/api/conversations?${buildQueryString(filters)}`),
    // Keep the current list visible while a filter change refetches — no skeleton flash.
    placeholderData: keepPreviousData,
  })

  // Re-rank every 30s so SLA drift reorders the queue without churning it each second.
  const [rankNow, setRankNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setRankNow(Date.now()), RANK_TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const items = query.data?.items
  const ranked = useMemo(() => (items ? rank(items, rankNow) : []), [items, rankNow])

  return {
    ranked,
    summary: query.data?.summary,
    tabCounts: query.data?.tabCounts,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
    isFetching: query.isFetching,
  }
}
