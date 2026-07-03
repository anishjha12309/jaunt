import { createContext, useContext, useEffect } from 'react'

/** A page's active shortcut bindings: key (from `KeyboardEvent.key`) → handler. */
export type KeyMap = Record<string, (() => void) | undefined>

export interface ShortcutsContextValue {
  overlayOpen: boolean
  setOverlayOpen: (open: boolean) => void
  /** The current ranked conversation order, published by the queue so the detail
   * view can move to the next/previous conversation without re-deriving it. */
  orderedIds: string[]
  setOrderedIds: (ids: string[]) => void
  /** Registers the active page's key handlers with the global listener. */
  setKeymap: (map: KeyMap | null) => void
}

export const ShortcutsContext = createContext<ShortcutsContextValue | null>(null)

export function useShortcutsContext(): ShortcutsContextValue {
  const value = useContext(ShortcutsContext)
  if (!value) throw new Error('useShortcutsContext must be used within a ShortcutsProvider')
  return value
}

/**
 * Register the active page's key bindings. Last writer wins — we deliberately do
 * NOT clear on cleanup: on a route swap the outgoing page's cleanup can run after
 * the incoming page registers, which would null out the live map. Exactly one page
 * is mounted at a time, so the most recent registration is always the right one.
 */
export function useShortcuts(map: KeyMap): void {
  const { setKeymap } = useShortcutsContext()
  useEffect(() => {
    setKeymap(map)
  }, [map, setKeymap])
}
