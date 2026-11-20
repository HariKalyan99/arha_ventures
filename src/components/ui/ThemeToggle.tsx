import { Moon, Sun } from 'lucide-react'
import { Magnetic } from './Magnetic'
import { useTheme } from '../../hooks/useTheme'

/**
 * Day / Night theme control — magnetic text-scroll button with icon.
 * Default site theme remains light (Day).
 */
export function ThemeToggle({ onMedia = false }: { onMedia?: boolean }) {
  const { theme, toggle, ready } = useTheme()
  const isNight = theme === 'dark'
  const current = isNight ? 'Night' : 'Day'
  const next = isNight ? 'Day' : 'Night'
  const ink = onMedia ? 'text-parchment' : 'text-cream'

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

  const button = (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-label={isNight ? 'Switch to day theme' : 'Switch to night theme'}
      aria-pressed={isNight}
      title={next}
      className={`group relative z-[70] inline-flex min-h-11 items-center px-1 ${ink} transition-opacity duration-300 disabled:pointer-events-none disabled:opacity-0`}
    >
      <span className="sr-only">{current}</span>
      <span aria-hidden className="relative block h-11 overflow-hidden">
        <span className="flex flex-col transition-transform duration-[650ms] ease-[var(--ease-luxe)] will-change-transform group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0">
          {row(current, isNight)}
          {row(next, !isNight)}
        </span>
      </span>
    </button>
  )

  return <Magnetic strength={0.22}>{button}</Magnetic>
}
