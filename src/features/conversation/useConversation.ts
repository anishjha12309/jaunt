import { useQuery } from '@tanstack/react-query'
import { ApiError, apiGet } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import type { Conversation } from '@/api/types'

export interface UseConversationResult {
  conversation: Conversation | undefined
  isPending: boolean
  isError: boolean
  /** A genuine 404 (unknown id) — render the "not found" state, not the retryable error. */
  notFound: boolean
  error: Error | null
  refetch: () => void
}

export function useConversation(id: string | undefined): UseConversationResult {
  const query = useQuery({
    queryKey: queryKeys.conversation(id ?? ''),
    queryFn: () => apiGet<Conversation>(`/api/conversations/${id}`),
    enabled: Boolean(id),
    // A 404 is a settled answer — don't burn the one global retry on it.
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 404 ? false : failureCount < 1,
  })

  const notFound = query.error instanceof ApiError && query.error.status === 404

  return {
    conversation: query.data,
    isPending: query.isPending,
    isError: query.isError,
    notFound,
    error: query.error,
    refetch: () => void query.refetch(),
  }
}
