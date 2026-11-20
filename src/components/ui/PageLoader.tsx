import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { ThemeLogo } from './ThemeLogo'

const HOLD_MS = 1000
const FADE_MS = 650

/** Module-level so React StrictMode remounts don’t treat the landing path as a navigation. */
let lastHandledPath: string | undefined

/**
 * Full-screen cream logo loader on every client-side route change.
 * First paint is handled by `#boot` / BootLoader — this ignores the landing path.
 */
export function PageLoader() {
  const { pathname } = useLocation()
  const [active, setActive] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (lastHandledPath === undefined || lastHandledPath === pathname) {
      lastHandledPath = pathname
      return
    }
    lastHandledPath = pathname

    let fadeTimer = 0
    let removeTimer = 0

    setLeaving(false)
    setActive(true)
    document.documentElement.classList.add('is-booting')

    fadeTimer = window.setTimeout(() => {
      setLeaving(true)
      document.documentElement.classList.remove('is-booting')
      removeTimer = window.setTimeout(() => setActive(false), FADE_MS)
    }, HOLD_MS)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [pathname])

  if (!active) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`page-loader fixed inset-0 z-[10000] flex items-center justify-center bg-ink transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        leaving ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <div className="page-loader-mark flex size-[clamp(8rem,28vw,14rem)] items-center justify-center">
          <ThemeLogo
            width={700}
            height={620}
            decoding="async"
            className="block size-full object-contain object-center"
          />
        </div>
        <div className="page-loader-dots absolute top-[calc(100%+1.25rem)] flex gap-2" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
