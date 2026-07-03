import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './styles/index.css'

const RELOAD_FLAG = 'msw-reloaded'

async function enableMocking(): Promise<void> {
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })

  // A hard refresh (Ctrl+Shift+R) or a stale worker can leave this page load
  // uncontrolled by the service worker, so API calls bypass MSW and get index.html
  // back. Recover once with a normal reload, which lets the active worker claim the
  // page; the sessionStorage guard prevents a reload loop if that ever fails.
  if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
    if (!sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1')
      window.location.reload()
      await new Promise(() => {}) // hold render until the reload takes over
    }
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
