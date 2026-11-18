import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

export interface ScrollApi {
  lenis: Lenis | null
  /** Scrolls to an element, a section id (without #) or a pixel offset. */
  scrollTo: (target: string | number | HTMLElement, options?: { immediate?: boolean; offset?: number }) => void
  stop: () => void
  start: () => void
}

export const ScrollContext = createContext<ScrollApi | null>(null)

export function useSmoothScroll(): ScrollApi {
  const ctx = useContext(ScrollContext)
  if (!ctx) throw new Error('useSmoothScroll must be used inside <SmoothScroll>')
  return ctx
}
