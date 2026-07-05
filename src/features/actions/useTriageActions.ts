import { useRef } from 'react'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { apiPatch } from '@/api/client'
import { queryKeys } from '@/api/queryKeys'
import type { Conversation, QueueFilters, QueueResponse, TriageAction } from '@/api/types'
import { belongsInView } from '@/lib/queueFilter'
import { applyTriageAction } from '@/lib/triage'
import { showToast } from '@/components/toastStore'
import { CURRENT_AGENT_ID } from '@/mocks/data'

const LIST_KEY = ['conversations'] as const
const UNDO_WINDOW_MS = 5000
const ERROR_DURATION_MS = 6000

interface TriageVars {
  id: string
  action: TriageAction
  snoozeMinutes?: number
  /** Set when this mutation IS an undo, so it doesn't offer its own Undo toast. */
  isUndo?: boolean
}

interface TriageContext {
  previousDetail: Conversation | undefined
  previousLists: [QueryKey, QueueResponse | undefined][]
}

const ACTION_VERB: Record<TriageAction, string> = {
  assign: 'assign',
  unassign: 'unassign',
  resolve: 'resolve',
  snooze: 'snooze',
  reopen: 'reopen',
}

const SUCCESS_LABEL: Partial<Record<TriageAction, string>> = {
  assign: 'Assigned to you',
  resolve: 'Resolved',
  snooze: 'Snoozed',
}

/** The inverse an Undo fires. Only the three primary actions are reversible. */
function inverseAction(action: TriageAction): TriageAction | null {
  switch (action) {
    case 'resolve':
    case 'snooze':
      return 'reopen'
    case 'assign':
      return 'unassign'
    default:
      return null
  }
}

function findInLists(
  lists: [QueryKey, QueueResponse | undefined][],
  id: string,
): Conversation | undefined {
  for (const [, data] of lists) {
    const found = data?.items.find((item) => item.id === id)
    if (found) return found
  }
  return undefined
}

/** Per-call hooks — the list uses `onError` to reverse a row's exit animation when a write fails. */
export interface ActOptions {
  onError?: () => void
  onSuccess?: () => void
}

export interface TriageActions {
  assign: (id: string, opts?: ActOptions) => void
  resolve: (id: string, opts?: ActOptions) => void
  snooze: (id: string, minutes: number, opts?: ActOptions) => void
  reopen: (id: string, opts?: ActOptions) => void
  isPending: boolean
}

export function useTriageActions(): TriageActions {
  const queryClient = useQueryClient()
  // Lets onError/onSuccess re-fire the mutation (Retry / Undo) without a forward reference.
  const fireRef = useRef<(vars: TriageVars) => void>(() => {})
  // Synchronous lock: `isPending` flips a render too late to stop rapid keypresses
  // firing in the same tick, so we gate on a ref that resets when the write settles.
  const inFlightRef = useRef(false)
  // Per-call callbacks ride on a ref, NOT on mutate(vars, {onError}) — TanStack Query
  // drops mutate-scoped callbacks once the calling component unmounts, and a row's
  // quick actions unmount mid-flight when the exit animation hides the row. The
  // hook-level handlers below survive unmount, so they relay to whatever was stashed.
  const perCallRef = useRef<ActOptions | undefined>(undefined)

  const mutation = useMutation<Conversation, Error, TriageVars, TriageContext>({
    mutationFn: ({ id, action, snoozeMinutes }) =>
      apiPatch<Conversation>(`/api/conversations/${id}`, { action, snoozeMinutes }),

    onMutate: async (vars) => {
      const detailKey = queryKeys.conversation(vars.id)
      await queryClient.cancelQueries({ queryKey: detailKey })
      await queryClient.cancelQueries({ queryKey: LIST_KEY })

      const previousDetail = queryClient.getQueryData<Conversation>(detailKey)
      const previousLists = queryClient.getQueriesData<QueueResponse>({ queryKey: LIST_KEY })

      const current = previousDetail ?? findInLists(previousLists, vars.id)
      if (current) {
        const now = Date.now()
        const updated = applyTriageAction(current, vars.action, now, CURRENT_AGENT_ID, vars.snoozeMinutes)
        queryClient.setQueryData(detailKey, updated)

        // Update each list in place only where the row still belongs; where the action
        // pushes it out of view, leave the cache untouched so nothing reorders — the row
        // is collapsed by the list and dropped when the refetch confirms the change.
        for (const [key, data] of previousLists) {
          if (!data) continue
          const filters = (key as [string, QueueFilters])[1]
          queryClient.setQueryData<QueueResponse>(key, {
            ...data,
            items: data.items.map((item) =>
              item.id === vars.id && belongsInView(updated, filters, now, CURRENT_AGENT_ID)
                ? updated
                : item,
            ),
          })
        }
      }

      return { previousDetail, previousLists }
    },

    onError: (_error, vars, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.conversation(vars.id), context.previousDetail)
        for (const [key, data] of context.previousLists) queryClient.setQueryData(key, data)
      }
      perCallRef.current?.onError?.()
      if (!vars.isUndo) {
        showToast(`Couldn't ${ACTION_VERB[vars.action]} — changes rolled back`, {
          tone: 'error',
          durationMs: ERROR_DURATION_MS,
          action: { label: 'Retry', onClick: () => fireRef.current(vars) },
        })
      }
    },

    onSuccess: (_data, vars) => {
      perCallRef.current?.onSuccess?.()
      if (vars.isUndo) return
      const inverse = inverseAction(vars.action)
      const label = SUCCESS_LABEL[vars.action]
      if (inverse && label) {
        showToast(label, {
          tone: 'success',
          durationMs: UNDO_WINDOW_MS,
          action: {
            label: 'Undo',
            onClick: () => fireRef.current({ id: vars.id, action: inverse, isUndo: true }),
          },
        })
      }
    },

    onSettled: (_data, _error, vars) => {
      inFlightRef.current = false
      perCallRef.current = undefined
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(vars.id) })
      queryClient.invalidateQueries({ queryKey: LIST_KEY })
    },
  })

  // Single entry point: drops any call while a write is in flight, so nothing
  // double-fires. Per-call callbacks run in addition to the hook's own handlers.
  const fire = (vars: TriageVars, opts?: ActOptions) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    perCallRef.current = opts
    mutation.mutate(vars)
  }
  fireRef.current = (vars) => fire(vars)

  return {
    assign: (id, opts) => fire({ id, action: 'assign' }, opts),
    resolve: (id, opts) => fire({ id, action: 'resolve' }, opts),
    snooze: (id, minutes, opts) => fire({ id, action: 'snooze', snoozeMinutes: minutes }, opts),
    reopen: (id, opts) => fire({ id, action: 'reopen' }, opts),
    isPending: mutation.isPending,
  }
}
