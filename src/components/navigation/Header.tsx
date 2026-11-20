import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useLocation } from 'react-router'
import { EASE_LUXE } from '../../lib/motion'
import { SiteMenu } from './SiteMenu'
import { Wordmark } from './Wordmark'

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
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const focusWithin = useRef(false)
  const { scrollY } = useScroll()
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), [])

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setSolid(y > window.innerHeight * (pathname === '/' ? 0.85 : 0.35))
    // Tuck the header away while reading downwards; bring it back on any upward scroll.
    setHidden(y > previous && y > window.innerHeight && !focusWithin.current && !menuOpen)
  })

  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setHidden(false)
    setSolid(false)
    setMenuOpen(false)
  }

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.9, ease: EASE_LUXE }}
        onFocus={() => {
          focusWithin.current = true
          setHidden(false)
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
          <MenuToggle open={menuOpen} onClick={toggleMenu} onMedia={pathname === '/' && !solid && !menuOpen} />
        </div>
      </motion.header>
      <SiteMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
