import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router'
import { navigation } from '../../data/site'
import { EASE_LUXE } from '../../lib/motion'
import { MobileMenu } from './MobileMenu'
import { Wordmark } from './Wordmark'

export function Header() {
  const { pathname } = useLocation()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const focusWithin = useRef(false)
  const { scrollY } = useScroll()
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setSolid(y > window.innerHeight * (pathname === '/' ? 0.85 : 0.35))
    // Tuck the header away while reading downwards; bring it back on any upward scroll.
    setHidden(y > previous && y > window.innerHeight && !focusWithin.current)
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
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          aria-hidden
          className={`absolute inset-0 border-b transition-all duration-700 ease-[var(--ease-luxe)] ${
            solid ? 'border-line bg-obsidian/85 backdrop-blur-md' : 'border-transparent bg-transparent'
          }`}
        />
        <div className="shell relative flex h-[var(--header-h)] items-center justify-between gap-6">
          <Wordmark />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-[clamp(1.25rem,2.4vw,2.75rem)]">
              {navigation
                .filter((n) => n.to !== '/contact')
                .map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `link-line eyebrow py-2 transition-colors duration-500 hover:text-cream ${isActive ? 'text-cream' : 'text-cream/65'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="group relative hidden min-h-11 items-center overflow-hidden border border-gold/50 px-5 eyebrow text-cream transition-colors duration-700 hover:text-obsidian sm:inline-flex"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-gold transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-y-100"
              />
              <span className="relative">Start a project</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="group flex min-h-11 min-w-11 items-center justify-center gap-3 px-2 eyebrow text-cream lg:hidden"
            >
              <span className="max-sm:sr-only">Menu</span>
              <span aria-hidden className="flex w-7 flex-col items-end gap-[6px]">
                <span className="h-px w-7 bg-cream transition-all duration-500 group-hover:w-5" />
                <span className="h-px w-5 bg-gold transition-all duration-500 group-hover:w-7" />
              </span>
            </button>
          </div>
        </div>
      </motion.header>
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
