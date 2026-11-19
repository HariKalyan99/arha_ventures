import { useEffect, useRef } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** px/ms — normal reading stays below this */
const SPEED_MIN = 3.2
/** px/ms — aggressive swipe reaches full strength */
const SPEED_FULL = 3.85
const LEVEL_ON = 0.08

/**
 * Speed-gated atmosphere (qdigital99 ChromaticRipple pattern, atelier-toned):
 * fast mouse sweeps surge film grain + a warm vignette that follows the cursor.
 * Idle / slow movement stays clear. Fine pointer only.
 */
export function CursorAtmosphere() {
  const veil = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced

  useEffect(() => {
    if (!enabled) return

    const root = document.documentElement
    const el = veil.current
    if (!el) return

    let raf = 0
    let running = false
    let last = performance.now()
    let lx = 0
    let ly = 0
    let lt = performance.now()
    let energy = 0
    let level = 0
    let cx = window.innerWidth * 0.5
    let cy = window.innerHeight * 0.5

    const apply = () => {
      root.style.setProperty('--grain-energy', level.toFixed(3))
      el.style.setProperty('--atmosphere-energy', level.toFixed(3))
      el.style.setProperty('--cx', `${cx.toFixed(1)}px`)
      el.style.setProperty('--cy', `${cy.toFixed(1)}px`)
    }

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      energy *= Math.pow(0.018, dt)
      level += (energy - level) * Math.min(1, dt * 12)

      if (level < LEVEL_ON && energy < LEVEL_ON) {
        level = 0
        apply()
        running = false
        return
      }

      apply()
      raf = requestAnimationFrame(tick)
    }

    const ensureRunning = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cx = e.clientX
      cy = e.clientY

      const now = performance.now()
      const dt = Math.max(now - lt, 1)
      const dist = Math.hypot(e.clientX - lx, e.clientY - ly)
      const speed = dist / dt
      lx = e.clientX
      ly = e.clientY
      lt = now

      // Always track position lightly so the vignette follows even at low energy
      el.style.setProperty('--cx', `${cx.toFixed(1)}px`)
      el.style.setProperty('--cy', `${cy.toFixed(1)}px`)

      if (speed < SPEED_MIN) return

      const t = clamp((speed - SPEED_MIN) / (SPEED_FULL - SPEED_MIN), 0, 1)
      const target = t * t * t
      if (target > energy) energy = target
      if (energy > LEVEL_ON) ensureRunning()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    apply()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      root.style.removeProperty('--grain-energy')
      el.style.removeProperty('--atmosphere-energy')
      el.style.removeProperty('--cx')
      el.style.removeProperty('--cy')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={veil}
      aria-hidden
      className="cursor-atmosphere pointer-events-none fixed inset-0 z-[89] hidden lg:block"
    />
  )
}
