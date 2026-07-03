import { useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { LenisContext } from '@/app/lenisContext'
import { REDUCED_MOTION_QUERY } from '@/lib/reducedMotion'

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    let instance: Lenis | null = null
    let raf = 0

    const start = () => {
      if (media.matches || instance) return
      instance = new Lenis({ lerp: 0.12 })
      setLenis(instance)
      const loop = (time: number) => {
        instance?.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      instance?.destroy()
      instance = null
      setLenis(null)
    }

    start()
    // Honour a mid-session reduced-motion toggle: tear the smooth scroll down or bring it back.
    const onChange = () => (media.matches ? stop() : start())
    media.addEventListener('change', onChange)

    return () => {
      media.removeEventListener('change', onChange)
      stop()
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
