import { createContext, useContext } from 'react'

export const NowContext = createContext<number>(Date.now())

export function useNow(): number {
  return useContext(NowContext)
}
