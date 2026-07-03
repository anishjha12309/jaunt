import type { QueueFilters } from '@/api/types'

export const queryKeys = {
  conversations: (filters: QueueFilters) => ['conversations', filters] as const,
  conversation: (id: string) => ['conversation', id] as const,
}
