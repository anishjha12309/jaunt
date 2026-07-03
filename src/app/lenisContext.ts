import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

export const LenisContext = createContext<Lenis | null>(null)

/** The live Lenis instance, or `null` under reduced motion / before init — callers fall back to native scroll. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}
