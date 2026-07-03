import { useEffect, useRef, type RefObject } from 'react'

/**
 * Moves focus to the returned element once it mounts — used on the page heading so a
 * route change lands a screen reader (and the keyboard tab order) at the top of the new
 * view. The heading takes `tabIndex={-1}` so it is programmatically focusable but stays
 * out of the normal tab sequence.
 */
export function useFocusOnMount<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}
