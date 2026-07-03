import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'

// All entrances use `useLayoutEffect` so GSAP sets the "from" state before the first
// paint (no flash of the final layout) and `gsap.matchMedia` so every timeline collapses
// to nothing under `prefers-reduced-motion` — the reduced-motion contract for the phase.
const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/** Slide + fade a single element in on mount. Used for the detail view enter. */
export function useFadeIn(ref: RefObject<HTMLElement | null>, y = 8, duration = 0.25): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.from(el, { y, opacity: 0, duration, ease: 'power2.out' })
    })
    return () => mm.revert()
  }, [ref, y, duration])
}

/** Stagger the direct children of a container in on first mount (queue rows). */
export function useStaggerIn(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const container = ref.current
    if (!container) return
    const items = container.querySelectorAll(':scope > *')
    if (items.length === 0) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.from(items, { y: 12, opacity: 0, duration: 0.32, ease: 'power2.out', stagger: 0.04 })
    })
    return () => mm.revert()
    // Runs once per mount only — the list stays mounted across refetches, so ranked
    // changes never re-trigger it (motion must not run on data refetch).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/**
 * Count a number element up from 0 to the value it mounts with, once (400ms). The live
 * value keeps flowing through the element's React children, so refetch updates show
 * instantly without re-animating.
 */
export function useCountUp(ref: RefObject<HTMLElement | null>, value: number | undefined): void {
  const targetRef = useRef(value)

  useLayoutEffect(() => {
    const el = ref.current
    const target = targetRef.current
    if (!el || target === undefined) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      const counter = { n: 0 }
      gsap.to(counter, {
        n: target,
        duration: 0.4,
        ease: 'power1.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.n))
        },
      })
    })
    return () => mm.revert()
  }, [ref])
}
