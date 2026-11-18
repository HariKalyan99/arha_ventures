import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { ScrollContext, type ScrollApi } from '../../lib/scroll-context'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

function resolveTarget(target: string | number | HTMLElement): HTMLElement | number | null {
  if (typeof target === 'number' || target instanceof HTMLElement) return target
  const id = target.replace(/^#/, '')
  return document.getElementById(id)
}

/**
 * Lenis smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis
 * share one animation frame and never disagree about the scroll position.
 * Disabled entirely when the visitor prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ lerp: 0.095, wheelMultiplier: 0.9, touchMultiplier: 1.2 })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // Lenis attaches to window, so it can only be created after mount and then published to consumers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance)
    if (import.meta.env.DEV) (window as unknown as { __lenis?: Lenis }).__lenis = instance
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  const api = useMemo<ScrollApi>(
    () => ({
      lenis,
      scrollTo(target, options = {}) {
        const resolved = resolveTarget(target)
        if (resolved === null) return
        if (lenis) {
          lenis.scrollTo(resolved, {
            immediate: options.immediate,
            offset: options.offset ?? 0,
            duration: 1.6,
            easing: (t: number) => 1 - Math.pow(1 - t, 4),
          })
          return
        }
        const top =
          typeof resolved === 'number' ? resolved : resolved.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0)
        window.scrollTo({ top, behavior: options.immediate || reduced ? 'auto' : 'smooth' })
      },
      stop: () => lenis?.stop(),
      start: () => lenis?.start(),
    }),
    [lenis, reduced],
  )

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>
}
