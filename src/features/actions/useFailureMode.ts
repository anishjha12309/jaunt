import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/api/client'

interface FailureState {
  enabled: boolean
}

const FAILURE_KEY = ['failureMode'] as const

/**
 * Reads and toggles the MSW failure flag through the dev endpoint, so the UI dot
 * and the mock layer can never disagree about whether writes are being failed.
 */
export function useFailureMode() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: FAILURE_KEY,
    queryFn: () => apiGet<FailureState>('/api/dev/failures'),
    staleTime: Infinity,
  })

  const mutation = useMutation({
    mutationFn: (enabled: boolean) => apiPost<FailureState>('/api/dev/failures', { enabled }),
    onSuccess: (data) => queryClient.setQueryData(FAILURE_KEY, data),
  })

  const enabled = query.data?.enabled ?? false

  return {
    enabled,
    isBusy: mutation.isPending,
    toggle: () => mutation.mutate(!enabled),
  }
}
