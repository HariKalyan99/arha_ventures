import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router'
import { navigation, studio } from '../../data/site'
import { EASE_CURTAIN, EASE_LUXE } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/scroll-context'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { ArrowLink } from '../ui/ArrowButton'

interface SiteMenuProps {
  open: boolean
  onClose: () => void
}

/** Full-viewport curtain navigation — used at every breakpoint in place of a link bar. */
export function SiteMenu({ open, onClose }: SiteMenuProps) {
  const panel = useRef<HTMLDivElement>(null)
  const { stop, start } = useSmoothScroll()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    stop()
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => {
      const nav = panel.current?.querySelector<HTMLElement>('[data-menu-scroll]')
      if (nav) nav.scrollTop = 0
      panel.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true })
    }, 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Trap focus across the curtain and the header toggle (same corner, outside the dialog node).
      const toggle = document.getElementById('menu-toggle')
      const inPanel = panel.current
        ? Array.from(panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        : []
      const focusable = [...inPanel, ...(toggle ? [toggle as HTMLElement] : [])]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      start()
      if (opener?.isConnected) opener.focus()
    }
  }, [open, onClose, stop, start])

  const curtainTransition = reduced
    ? { duration: 0.01 }
    : { duration: 0.9, ease: EASE_CURTAIN }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[60] flex flex-col bg-obsidian pt-[var(--header-h)]"
          initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={curtainTransition}
        >
          <nav
            aria-label="Primary"
            data-menu-scroll
            className="no-scrollbar shell flex flex-1 flex-col overflow-y-auto py-6 sm:py-8"
          >
            {/* min-h-full + justify-center keeps the list optically centred when it fits, without clipping the first item when it doesn’t. */}
            <div className="flex min-h-full flex-col justify-center">
              <ul className="flex max-w-4xl flex-col">
                {navigation.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={reduced ? false : { y: 36, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduced ? undefined : { y: 16, opacity: 0, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.95, ease: EASE_LUXE, delay: reduced ? 0 : 0.28 + i * 0.055 }}
                    className="border-b border-line"
                  >
                    <NavLink to={item.to} onClick={onClose} className="group flex items-baseline gap-5 py-2.5 sm:py-3.5 lg:py-4">
                      {({ isActive }) => (
                        <>
                          <span className="eyebrow w-8 shrink-0 text-gold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                          <span
                            className={`display text-[clamp(2.2rem,6.5vw,5rem)] leading-[0.95] transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-3 group-focus-visible:translate-x-3 motion-reduce:transition-none ${
                              isActive ? 'text-gold-soft italic' : 'text-cream'
                            }`}
                          >
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </div>
          </nav>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: reduced ? 0 : 0.55, duration: 0.8, ease: EASE_LUXE } }}
            exit={{ opacity: 0 }}
            className="shell flex shrink-0 flex-col gap-8 py-8 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="flex flex-col gap-5">
              <ArrowLink to="/contact" variant="solid" className="self-start">
                Start a project
              </ArrowLink>
              <div className="flex flex-col gap-1 text-sm text-cream/70">
                <a href={`mailto:${studio.email}`} className="link-line w-fit text-cream">
                  {studio.email}
                </a>
                <span>{studio.phone}</span>
              </div>
            </div>
            <ul className="flex flex-wrap gap-5">
              {studio.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="link-line eyebrow text-cream/70">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
