export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      return body.message
    }
  } catch {
    // response had no JSON body — fall through to the status text
  }
  return response.statusText || `Request failed with status ${response.status}`
}

function isJsonResponse(response: Response): boolean {
  return (response.headers.get('content-type') ?? '').includes('application/json')
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }
  // A non-JSON body means the request bypassed the MSW worker and hit the host's
  // SPA fallback (index.html). Surface an actionable message instead of a raw
  // "Unexpected token '<'" JSON parse error.
  if (!isJsonResponse(response)) {
    throw new ApiError(response.status, 'Mock API unavailable — reload the page to start the service worker.')
  }
  return response.json() as Promise<T>
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response = await fetch(url, init)
  // A bypassed request means the browser terminated the idle mock service worker
  // and its restart lost this tab's registration — re-activate it and retry once.
  if (response.ok && !isJsonResponse(response)) {
    const { reviveMockWorker } = await import('@/mocks/reviveWorker')
    if (await reviveMockWorker()) {
      response = await fetch(url, init)
    }
  }
  return handleResponse<T>(response)
}

export async function apiGet<T>(url: string): Promise<T> {
  return requestJson<T>(url)
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  return requestJson<T>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  return requestJson<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
