import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { setupServer } from 'msw/node'
import type { Conversation } from '@/api/types'
import { apiPatch } from '@/api/client'
import { conversations } from '@/mocks/data'
import { setFailureMode } from '@/mocks/failureFlag'
import { handlers } from '@/mocks/handlers'

// Real handlers + real seed data, so this exercises the actual timing contract between
// randomDelay() and the failure flag rather than a test-only override.
const server = setupServer(...handlers)

// The client fetches relative URLs ("/api/…"); undici (Node's fetch) can't resolve those
// without an origin. Resolve them against jsdom's origin before the MSW-patched fetch
// handles them — same approach as useTriageActions.test.tsx.
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
afterEach(() => {
  server.resetHandlers()
  setFailureMode(false)
})
afterAll(() => server.close())

// Give the handler's synchronous prefix (where it now reads the flag) time to run before
// flipping the toggle, while staying well under randomDelay()'s 200ms floor — this mirrors
// the real bug: a user flips the toggle while an unrelated write is genuinely mid-flight,
// not the same JS tick as dispatch (which races MSW's own request-interception plumbing).
const MID_FLIGHT_MS = 20

describe('PATCH /api/conversations/:id failure toggle timing', () => {
  it('ignores a toggle flip that happens while an unrelated request is already in flight', async () => {
    const id = conversations[0]!.id
    setFailureMode(false)

    const pending = apiPatch<Conversation>(`/api/conversations/${id}`, { action: 'resolve' })
    await new Promise((resolve) => setTimeout(resolve, MID_FLIGHT_MS))
    setFailureMode(true)

    await expect(pending).resolves.toMatchObject({ id })
  })

  it('does not retroactively rescue a request dispatched while failure mode was on', async () => {
    const id = conversations[1]!.id
    setFailureMode(true)

    const pending = apiPatch<Conversation>(`/api/conversations/${id}`, { action: 'resolve' })
    await new Promise((resolve) => setTimeout(resolve, MID_FLIGHT_MS))
    setFailureMode(false)

    await expect(pending).rejects.toThrow('Simulated network failure')
  })
})
