import { useEffect } from 'react'

const BASE_TITLE = 'Conversation Inbox'

/** Sets `document.title` per route so the browser tab and history reflect the current view. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
