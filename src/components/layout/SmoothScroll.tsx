import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { bindAppHeightSync } from '../../lib/layout'
import { ScrollContext, type ScrollApi } from '../../lib/scroll-context'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

function resolveTarget(target: string | number | HTMLElement): HTMLElement | number | null {
  if (typeof target === 'number' || target instanceof HTMLElement) return target
  const id = target.replace(/^#/, '')
  return document.getElementById(id)
}

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent)
}

function isAppleTouchDevice() {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true
  /* iPadOS 13+ reports as Macintosh — use touch points. */
  return navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent)
}

/** Match Magical Works: leave OS scroll alone on phones, tablets, and coarse pointers. */
function prefersNativeScroll(reduced: boolean) {
  if (reduced) return true
  if (isAndroidDevice() || isAppleTouchDevice()) return true
  if (window.matchMedia('(pointer: coarse)').matches) return true
  if (window.matchMedia('(max-width: 1023px)').matches) return true
  return false
}

/**
 * Scroll-driven hero tours need the browser’s native scroll clock on touch.
 * Lenis only runs on fine-pointer desktops (wheel), never with syncTouch.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true })
    ScrollTrigger.defaults({ pinType: 'fixed' })

    const unbindHeight = bindAppHeightSync()
    const onAppHeight = () => ScrollTrigger.refresh()
    window.addEventListener('arha:app-height', onAppHeight)

    const root = document.documentElement
    const useNative = prefersNativeScroll(reduced)

    if (useNative) {
      root.classList.add('native-scroll')
      root.classList.remove('lenis', 'lenis-smooth')
      setLenis(null)

      const onScroll = () => ScrollTrigger.update()
      window.addEventListener('scroll', onScroll, { passive: true })

      return () => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('arha:app-height', onAppHeight)
        unbindHeight()
        root.classList.remove('native-scroll')
      }
    }

    root.classList.add('lenis', 'lenis-smooth')
    root.classList.remove('native-scroll')

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
      window.removeEventListener('arha:app-height', onAppHeight)
      unbindHeight()
      root.classList.remove('lenis', 'lenis-smooth')
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
