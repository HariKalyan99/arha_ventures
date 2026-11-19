import { Suspense, useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollTrigger } from '../../lib/gsap'
import { EASE_CURTAIN, EASE_LUXE } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/scroll-context'
import { Header } from '../navigation/Header'
import { Footer } from './Footer'
import { CustomCursor } from '../ui/CustomCursor'
import { CursorAtmosphere } from '../ui/CursorAtmosphere'

function PageFallback() {
  return (
    <div className="flex h-svh items-center justify-center bg-obsidian" role="status">
      <span className="eyebrow text-cream/50">Loading</span>
    </div>
  )
}

/** Resets scroll and re-measures scroll-linked animations once a new page has mounted. */
function PageReady() {
  const { scrollTo } = useSmoothScroll()
  useEffect(() => {
    scrollTo(0, { immediate: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [scrollTo])
  return null
}

export function Layout() {
  const location = useLocation()
  // Captured per render so the outgoing page keeps its content during the exit transition.
  const outlet = useOutlet()

  return (
    <>
      <CustomCursor />
      <CursorAtmosphere />
      {/* Sticky terracotta wash at the bottom of the frame */}
      <div aria-hidden className="terracotta-vignette-bottom" />
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
                {outlet}
                <PageReady />
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
