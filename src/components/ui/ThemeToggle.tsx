import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Magnetic } from './Magnetic'
import { useTheme } from '../../hooks/useTheme'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

const ROLL_MS = 650

/**
 * Day / Night theme control — magnetic text-scroll button with icon.
 * The label roll runs on click across every pointer; hover still previews on desktop.
 * Default site theme is dark (Night).
 */
export function ThemeToggle({ onMedia = false }: { onMedia?: boolean }) {
  const { theme, toggle, ready } = useTheme()
  const reduced = usePrefersReducedMotion()
  const [rolling, setRolling] = useState(false)
  /** Skip transition for one frame after a roll so the stack can reset without sliding back. */
  const [cold, setCold] = useState(false)
  const timer = useRef<number>(0)

  const isNight = theme === 'dark'
  const current = isNight ? 'Night' : 'Day'
  const next = isNight ? 'Day' : 'Night'
  const ink = onMedia ? 'text-parchment' : 'text-cream'

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const row = (label: string, night: boolean) => (
    <span className="flex h-11 items-center gap-2.5 eyebrow">
      <span>{label}</span>
      {night ? (
        <Moon aria-hidden className="size-3.5 shrink-0" strokeWidth={1.25} />
      ) : (
        <Sun aria-hidden className="size-3.5 shrink-0" strokeWidth={1.25} />
      )}
    </span>
  )

  const onClick = () => {
    if (!ready || rolling) return
    if (reduced) {
      toggle()
      return
    }
    setRolling(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCold(true)
      toggle()
      setRolling(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setCold(false))
      })
    }, ROLL_MS)
  }

  const shifted = rolling
  const animate = !cold && !reduced

  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready}
      aria-label={isNight ? 'Switch to day theme' : 'Switch to night theme'}
      aria-pressed={isNight}
      title={next}
      className={`group relative z-[70] inline-flex min-h-11 items-center px-1 ${ink} transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-0`}
    >
      <span className="sr-only">{current}</span>
      <span aria-hidden className="relative block h-11 overflow-hidden">
        <span
          className={`flex flex-col will-change-transform ${
            animate ? 'transition-transform duration-[650ms] ease-[var(--ease-luxe)]' : 'transition-none'
          } ${
            shifted
              ? '-translate-y-1/2'
              : 'translate-y-0 group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0'
          }`}
        >
          {row(current, isNight)}
          {row(next, !isNight)}
        </span>
      </span>
    </button>
  )

  return <Magnetic strength={0.22}>{button}</Magnetic>
}
