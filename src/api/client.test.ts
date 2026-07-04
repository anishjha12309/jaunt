import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiGet, apiPatch } from '@/api/client'
import { reviveMockWorker } from '@/mocks/reviveWorker'

vi.mock('@/mocks/reviveWorker', () => ({
  reviveMockWorker: vi.fn(),
}))

const reviveMock = vi.mocked(reviveMockWorker)

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// What the host's SPA fallback returns when the service worker bypasses /api/*.
function htmlResponse(): Response {
  return new Response('<!doctype html><html></html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('mock-worker revival on bypassed requests', () => {
  it('returns JSON directly without touching the worker', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'conv-1' }))

    await expect(apiGet('/api/conversations/conv-1')).resolves.toEqual({ id: 'conv-1' })
    expect(reviveMock).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('re-activates the worker and retries once when the request was bypassed', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse()).mockResolvedValueOnce(jsonResponse({ id: 'conv-1' }))
    reviveMock.mockResolvedValueOnce(true)

    await expect(apiGet('/api/conversations/conv-1')).resolves.toEqual({ id: 'conv-1' })
    expect(reviveMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries a bypassed write with the same method and body', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse()).mockResolvedValueOnce(jsonResponse({ status: 'resolved' }))
    reviveMock.mockResolvedValueOnce(true)

    await apiPatch('/api/conversations/conv-1', { status: 'resolved' })

    const [firstCall, secondCall] = fetchMock.mock.calls
    expect(secondCall).toEqual(firstCall)
    expect(secondCall?.[1]).toMatchObject({ method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) })
  })

  it('surfaces the actionable error when revival is impossible', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse())
    reviveMock.mockResolvedValueOnce(false)

    await expect(apiGet('/api/conversations')).rejects.toThrowError(
      new ApiError(200, 'Mock API unavailable — reload the page to start the service worker.'),
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('surfaces the actionable error when the retry is still bypassed', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse()).mockResolvedValueOnce(htmlResponse())
    reviveMock.mockResolvedValueOnce(true)

    await expect(apiGet('/api/conversations')).rejects.toThrowError(/Mock API unavailable/)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
