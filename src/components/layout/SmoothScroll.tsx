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

function isCoarsePointer() {
  return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window
}

/**
 * Scroll-driven hero tours need the browser’s native scroll clock.
 * Lenis only runs on fine-pointer desktops (wheel), with a high lerp so it
 * barely lags ScrollTrigger. Touch / stylus always use native scroll.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })

    if (reduced || isCoarsePointer()) {
      setLenis(null)
      return
    }

    const instance = new Lenis({
      /* High lerp ≈ native wheel; keep wheel gentle so the long tour doesn’t rush. */
      lerp: 0.18,
      wheelMultiplier: 0.72,
      touchMultiplier: 1,
      syncTouch: false,
      autoRaf: false,
    })

    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

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
            duration: 1.2,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
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
