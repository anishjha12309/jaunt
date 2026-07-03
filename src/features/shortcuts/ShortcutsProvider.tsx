import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isTypingTarget } from '@/lib/isTypingTarget'
import {
  ShortcutsContext,
  type KeyMap,
  type ShortcutsContextValue,
} from '@/features/shortcuts/shortcutsContext'
import { ShortcutsOverlay } from '@/features/shortcuts/ShortcutsOverlay'

/**
 * One window-level keydown listener drives every shortcut. It stays out of the way
 * while the user is typing or holding a browser modifier, owns the `?` help overlay,
 * and delegates the rest to whichever page registered a keymap.
 */
export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const keymapRef = useRef<KeyMap | null>(null)
  const overlayOpenRef = useRef(overlayOpen)
  overlayOpenRef.current = overlayOpen

  const setKeymap = useCallback((map: KeyMap | null) => {
    keymapRef.current = map
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const typing = isTypingTarget(event.target)

      if (event.key === '?') {
        if (typing) return
        event.preventDefault()
        setOverlayOpen(!overlayOpenRef.current)
        return
      }
      if (overlayOpenRef.current) {
        if (event.key === 'Escape') {
          event.preventDefault()
          setOverlayOpen(false)
        }
        return
      }
      if (typing) return
      // Let an open menu handle its own arrows/enter/escape.
      if (event.target instanceof HTMLElement && event.target.closest('[role="menu"]')) return

      const handler = keymapRef.current?.[event.key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo<ShortcutsContextValue>(
    () => ({ overlayOpen, setOverlayOpen, orderedIds, setOrderedIds, setKeymap }),
    [overlayOpen, orderedIds, setKeymap],
  )

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      {overlayOpen && <ShortcutsOverlay onClose={() => setOverlayOpen(false)} />}
    </ShortcutsContext.Provider>
  )
}
