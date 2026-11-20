import { Suspense, useLayoutEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from '../../lib/gsap'
import { EASE_CURTAIN, EASE_LUXE } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/scroll-context'
import { Header } from '../navigation/Header'
import { Footer } from './Footer'
import { SoundFeedback } from '../bencho/sounds/SoundFeedback'
import { CustomCursor } from '../ui/CustomCursor'
import { PageLoader } from '../ui/PageLoader'

function PageFallback() {
  /* Paper hold — parchment boot is reserved for #boot / PageLoader only */
  return <div className="min-h-svh bg-obsidian" role="status" aria-label="Loading" />
}

/** Wipe ScrollTriggers left by the previous route (pins / reveals). */
function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((st) => {
    try {
      st.kill()
    } catch {
      /* already dead */
    }
  })
}

/** Resets scroll after the new page has mounted and re-measures triggers. */
function PageReady() {
  const { scrollTo } = useSmoothScroll()
  useLayoutEffect(() => {
    scrollTo(0, { immediate: true })
    const id = requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh()
        const y = ScrollTrigger.scroll()
        ScrollTrigger.getAll().forEach((st) => {
          if (!st.vars.once || !st.animation) return
          if (st.start <= y + 1) st.animation.progress(1)
        })
      } catch {
        /* page content stays; skip a corrupt refresh */
      }
    })
    return () => cancelAnimationFrame(id)
  }, [scrollTo])
  return null
}

export function Layout() {
  const location = useLocation()
  const outlet = useOutlet()
  const { scrollTo } = useSmoothScroll()
  /* Survives AnimatePresence remounts — gate scroll kill before the next page mounts. */
  const [scrollReadyPath, setScrollReadyPath] = useState(location.pathname)
  const scrollReady = scrollReadyPath === location.pathname

  useLayoutEffect(() => {
    if (scrollReady) return
    killScrollTriggers()
    /* Reset scroll before mounting the next page so reveal triggers measure correctly. */
    scrollTo(0, { immediate: true })
    setScrollReadyPath(location.pathname)
  }, [location.pathname, scrollReady, scrollTo])

  return (
    <>
      <PageLoader />
      <CustomCursor />
      <SoundFeedback />
      {/* Sticky terracotta wash at the bottom of the frame */}
      <div aria-hidden data-brand-vignette className="terracotta-vignette-bottom" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-terracotta focus:px-4 focus:py-3 focus:text-cream"
      >
        Skip to content
      </a>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8, ease: EASE_LUXE } }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: EASE_CURTAIN } }}
          >
            <main id="main" tabIndex={-1} className="outline-none">
              <Suspense fallback={<PageFallback />}>
                {scrollReady ? (
                  <>
                    {outlet}
                    <PageReady />
                  </>
                ) : (
                  <PageFallback />
                )}
              </Suspense>
            </main>
            <Footer />
          </motion.div>
          {/* Brand hairline sweeps across as each page arrives */}
          <motion.span
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-px origin-left bg-terracotta"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 0, transition: { scaleX: { duration: 1.1, ease: EASE_CURTAIN }, opacity: { delay: 0.9, duration: 0.5 } } }}
          />
        </motion.div>
      </AnimatePresence>
    </>
  )
}
