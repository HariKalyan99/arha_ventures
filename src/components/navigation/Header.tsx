import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useLocation } from 'react-router'
import { EASE_LUXE } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/scroll-context'
import { ThemeToggle } from '../ui/ThemeToggle'
import { SiteMenu } from './SiteMenu'
import { Wordmark } from './Wordmark'

/** Ignore sub-threshold deltas so Lenis lerp / sticky reflow jitter cannot flash the header. */
const HIDE_SCROLL_DELTA = 10
/** Extra upward travel required before the tucked header returns (hysteresis). */
const REVEAL_SCROLL_DELTA = 48
/** Leave the absolute top before tucking — not a full viewport (tour stop 02 lives ~1vh in). */
const TOP_SHOW_Y = 64

function MenuToggle({ open, onClick, onMedia }: { open: boolean; onClick: () => void; onMedia?: boolean }) {
  const ink = onMedia ? 'text-parchment' : 'text-cream'
  const bar = onMedia ? 'bg-parchment' : 'bg-cream'
  return (
    <button
      id="menu-toggle"
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="site-menu"
      className={`group relative z-[70] flex min-h-11 min-w-11 items-center justify-center gap-3 px-1 eyebrow ${ink}`}
    >
      <span className="max-sm:sr-only">{open ? 'Close' : 'Menu'}</span>
      <span aria-hidden className="relative flex h-[14px] w-7 items-center justify-center">
        <span
          className={`absolute h-px w-7 origin-center ${bar} transition-[transform,width,background-color] duration-500 ease-[var(--ease-luxe)] motion-reduce:transition-none ${
            open ? 'translate-y-0 rotate-45 bg-gold' : '-translate-y-[3.5px] group-hover:w-5'
          }`}
        />
        <span
          className={`absolute h-px w-5 origin-center bg-gold transition-[transform,width,opacity,background-color] duration-500 ease-[var(--ease-luxe)] motion-reduce:transition-none ${
            open ? 'w-7 translate-y-0 -rotate-45 bg-gold' : 'translate-y-[3.5px] group-hover:w-7'
          }`}
        />
      </span>
    </button>
  )
}

export function Header() {
  const { pathname } = useLocation()
  const { lenis } = useSmoothScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const focusWithin = useRef(false)
  const lastY = useRef(0)
  const upwardAcc = useRef(0)
  const hiddenRef = useRef(false)
  const menuOpenRef = useRef(menuOpen)
  menuOpenRef.current = menuOpen
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const { scrollY } = useScroll()
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), [])

  const setHeaderHidden = useCallback((next: boolean) => {
    hiddenRef.current = next
    setHidden(next)
    if (!next) upwardAcc.current = 0
  }, [])

  const applyScrollChrome = useCallback(
    (y: number, delta: number) => {
      const onHome = pathnameRef.current === '/'
      const hero = onHome ? document.getElementById('top') : null
      // Match sticky stage (--app-height / layout viewport), not visualViewport chrome.
      const stageH = document.documentElement.clientHeight || window.innerHeight
      const heroTravel = hero ? Math.max(0, hero.offsetHeight - stageH) : 0
      const inHeroTour = Boolean(hero && y < heroTravel)
      const solidAfter = stageH * (onHome ? 0.85 : 0.35)
      // Paper solid chrome over the dark loft reads as a flash — keep it off during the tour.
      setSolid(!inHeroTour && y > solidAfter)

      if (focusWithin.current || menuOpenRef.current) {
        setHeaderHidden(false)
        return
      }

      // Only pin the header at the true top. A full-viewport gate fought Lenis near stop 02.
      if (y <= TOP_SHOW_Y) {
        setHeaderHidden(false)
        return
      }

      // Cinematic tour: once the loft owns the scroll, keep chrome tucked until the section releases.
      if (inHeroTour) {
        upwardAcc.current = 0
        setHeaderHidden(true)
        return
      }

      if (delta > 0) {
        upwardAcc.current = 0
        setHeaderHidden(true)
        return
      }

      if (delta < 0) {
        upwardAcc.current += -delta
        if (hiddenRef.current && upwardAcc.current >= REVEAL_SCROLL_DELTA) {
          setHeaderHidden(false)
        }
      }
    },
    [setHeaderHidden],
  )

  // Prefer Lenis scroll — same clock as the page; accumulate deltas for reveal hysteresis.
  useEffect(() => {
    if (!lenis) return
    const onScroll = (instance: { scroll: number }) => {
      const y = instance.scroll
      const delta = y - lastY.current
      lastY.current = y
      if (Math.abs(delta) < 0.5) return
      applyScrollChrome(y, delta)
    }
    return lenis.on('scroll', onScroll)
  }, [lenis, applyScrollChrome])

  // Fallback when reduced-motion disables Lenis.
  useMotionValueEvent(scrollY, 'change', (y) => {
    if (lenis) return
    const delta = y - lastY.current
    lastY.current = y
    if (Math.abs(delta) < HIDE_SCROLL_DELTA) {
      applyScrollChrome(y, 0)
      return
    }
    applyScrollChrome(y, delta)
  })

  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setHeaderHidden(false)
    setSolid(false)
    setMenuOpen(false)
    lastY.current = 0
    upwardAcc.current = 0
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.9, ease: EASE_LUXE }}
        onFocus={() => {
          focusWithin.current = true
          setHeaderHidden(false)
        }}
        onBlur={() => (focusWithin.current = false)}
        className="fixed inset-x-0 top-0 z-[70]"
      >
        <div
          aria-hidden
          className={`absolute inset-0 border-b transition-all duration-700 ease-[var(--ease-luxe)] ${
            menuOpen
              ? 'border-transparent bg-transparent'
              : solid
                ? 'border-line bg-obsidian/85 backdrop-blur-md'
                : 'border-transparent bg-transparent'
          }`}
        />
        <div className="shell relative flex h-[var(--header-h)] items-center justify-between gap-6">
          <Wordmark onNavigate={menuOpen ? closeMenu : undefined} />
          {/* Frosted cluster over the loft — parchment ink alone fails on the light mezzanine */}
          <div
            className={`flex items-center gap-0.5 sm:gap-1 ${
              pathname === '/' && !solid && !menuOpen
                ? 'rounded-full border border-parchment/18 bg-[#111111]/62 px-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.28)] backdrop-blur-md sm:px-2'
                : ''
            }`}
          >
            <ThemeToggle onMedia={pathname === '/' && !solid && !menuOpen} />
            <MenuToggle open={menuOpen} onClick={toggleMenu} onMedia={pathname === '/' && !solid && !menuOpen} />
          </div>
        </div>
      </motion.header>
      <SiteMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
