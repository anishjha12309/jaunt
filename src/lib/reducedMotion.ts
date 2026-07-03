import { useEffect, useState } from 'react'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Imperative check for one-off decisions (Lenis init, three mount, tween duration). */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Reactive variant: re-renders when the OS setting flips so components can swap to a static fallback. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}
