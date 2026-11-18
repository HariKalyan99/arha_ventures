import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router'
import { X } from 'lucide-react'
import { navigation, studio } from '../../data/site'
import { EASE_CURTAIN, EASE_LUXE } from '../../lib/motion'
import { useSmoothScroll } from '../../lib/scroll-context'
import { Wordmark } from './Wordmark'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const { stop, start } = useSmoothScroll()

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    stop()
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => closeButton.current?.focus(), 50)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      // Keep keyboard focus inside the open dialog.
      const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[60] flex flex-col bg-obsidian"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: EASE_CURTAIN }}
        >
          <div className="shell flex h-[var(--header-h)] items-center justify-between">
            <Wordmark onNavigate={onClose} />
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              className="flex min-h-11 min-w-11 items-center justify-center gap-3 eyebrow text-cream"
            >
              <span className="max-sm:sr-only">Close</span>
              <X aria-hidden className="size-5 text-gold" strokeWidth={1.25} />
            </button>
          </div>

          <nav aria-label="Mobile" className="shell flex flex-1 flex-col justify-center overflow-y-auto py-6">
            <ul className="flex flex-col">
              {navigation.map((item, i) => (
                <motion.li
                  key={item.to}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 1, ease: EASE_LUXE, delay: 0.25 + i * 0.06 }}
                  className="border-b border-line"
                >
                  <NavLink to={item.to} onClick={onClose} className="group flex items-baseline gap-5 py-3 sm:py-4">
                    {({ isActive }) => (
                      <>
                        <span className="eyebrow w-8 text-gold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                        <span
                          className={`display text-[clamp(2.2rem,8.5vw,4.5rem)] leading-none transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-3 group-focus-visible:translate-x-3 ${
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
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.8 } }}
            exit={{ opacity: 0 }}
            className="shell flex flex-col gap-4 pb-8 text-sm text-cream/70 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <a href={`mailto:${studio.email}`} className="link-line w-fit text-cream">
                {studio.email}
              </a>
              <span>{studio.phone}</span>
            </div>
            <ul className="flex gap-5">
              {studio.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="link-line eyebrow">
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
