import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'
import type { Conversation } from '@/api/types'
import { queryKeys } from '@/api/queryKeys'
import { useTriageActions } from '@/features/actions/useTriageActions'
import { makeConversation } from '@/test/factories'

// The hook is named useTriageActions here (architecture.md's placeholder name was
// useConversationActions); this is the same optimistic-mutation contract it describes.
const server = setupServer()

// The client fetches relative URLs ("/api/…"); undici (Node's fetch) can't resolve those
// without an origin. Resolve them against jsdom's origin — the same base MSW uses to match
// its relative path handlers — before the MSW-patched fetch handles them.
let mswFetch: typeof fetch
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  mswFetch = globalThis.fetch
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string' && input.startsWith('/')
        ? new URL(input, globalThis.location.origin).href
        : input
    return mswFetch(url, init)
  }) as typeof fetch
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function wrapperFor(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

function testClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } },
  })
}

const detailKey = (id: string) => queryKeys.conversation(id)

describe('useTriageActions', () => {
  it('applies the change optimistically before the server responds, and keeps it on success', async () => {
    const conversation = makeConversation({ id: 'conv-1', status: 'open' })
    server.use(
      http.patch('/api/conversations/:id', async () => {
        await delay(80) // hold the reply so the optimistic write is observable first
        return HttpResponse.json({ ...conversation, status: 'resolved' })
      }),
    )

    const client = testClient()
    client.setQueryData(detailKey('conv-1'), conversation)
    const { result } = renderHook(() => useTriageActions(), { wrapper: wrapperFor(client) })

    act(() => {
      result.current.resolve('conv-1')
    })

    // Cache flips to resolved well before the 80ms server response — that is the optimism.
    await waitFor(() => {
      expect(client.getQueryData<Conversation>(detailKey('conv-1'))?.status).toBe('resolved')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    expect(client.getQueryData<Conversation>(detailKey('conv-1'))?.status).toBe('resolved')
  })

  it('rolls the cache back to the previous state when the write fails with a 500', async () => {
    const conversation = makeConversation({ id: 'conv-2', status: 'open' })
    server.use(
      http.patch('/api/conversations/:id', () =>
        HttpResponse.json({ message: 'Simulated network failure' }, { status: 500 }),
      ),
    )

    const client = testClient()
    client.setQueryData(detailKey('conv-2'), conversation)
    const { result } = renderHook(() => useTriageActions(), { wrapper: wrapperFor(client) })

    act(() => {
      result.current.resolve('conv-2')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
    // The optimistic 'resolved' has been reverted to the snapshotted 'open'.
    expect(client.getQueryData<Conversation>(detailKey('conv-2'))?.status).toBe('open')
  })

  it('still runs the per-call onError when the caller unmounted mid-flight', async () => {
    // A queue row's quick actions unmount once the exit animation hides the row —
    // mutate-scoped callbacks are dropped on unmount, so the un-collapse callback
    // must survive through the hook-level handlers instead.
    const conversation = makeConversation({ id: 'conv-3', status: 'open' })
    server.use(
      http.patch('/api/conversations/:id', async () => {
        await delay(80)
        return HttpResponse.json({ message: 'Simulated network failure' }, { status: 500 })
      }),
    )

    const client = testClient()
    client.setQueryData(detailKey('conv-3'), conversation)
    const { result, unmount } = renderHook(() => useTriageActions(), { wrapper: wrapperFor(client) })

    let onErrorRan = false
    act(() => {
      result.current.resolve('conv-3', { onError: () => (onErrorRan = true) })
    })
    unmount() // the row disappeared while the PATCH was still in flight

    await waitFor(() => expect(onErrorRan).toBe(true))
    expect(client.getQueryData<Conversation>(detailKey('conv-3'))?.status).toBe('open')
  })
})
