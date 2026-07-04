import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './styles/index.css'

const RELOAD_FLAG = 'msw-reloaded'
const READY_PROBE_ATTEMPTS = 5
const READY_PROBE_DELAY_MS = 150

// A bypassed request (worker not yet controlling the page) hits Vite's dev-server
// SPA fallback instead, which answers with index.html — so a real JSON body is proof
// the mock layer is actually intercepting, unlike `navigator.serviceWorker.controller`
// (set by the browser's own async client-claiming, which can lag MSW's own ready signal).
async function isMockReady(): Promise<boolean> {
  const response = await fetch('/api/dev/failures')
  return (response.headers.get('content-type') ?? '').includes('application/json')
}

async function enableMocking(): Promise<void> {
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })

  for (let attempt = 0; attempt < READY_PROBE_ATTEMPTS; attempt += 1) {
    if (await isMockReady()) {
      sessionStorage.removeItem(RELOAD_FLAG)
      return
    }
    await new Promise((resolve) => setTimeout(resolve, READY_PROBE_DELAY_MS))
  }

  // Still bypassed after the probe window — a stale worker left over from a hard
  // refresh. One normal reload lets the active worker claim the page; the
  // sessionStorage guard prevents a reload loop if that ever fails.
  if (!sessionStorage.getItem(RELOAD_FLAG)) {
    sessionStorage.setItem(RELOAD_FLAG, '1')
    window.location.reload()
    await new Promise(() => {}) // hold render until the reload takes over
  }
  sessionStorage.removeItem(RELOAD_FLAG)
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
