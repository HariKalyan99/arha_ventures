import { useRef, type MouseEvent, type ReactNode } from 'react'
import { gsap } from '../../lib/gsap'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

/**
 * Magnetic hover — element drifts toward the cursor and snaps back.
 * Fine pointer + motion preference only; otherwise renders children as-is.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced

  if (!enabled) return <>{children}</>

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)
    gsap.to(el, { x: x * strength, y: y * strength, duration: 0.65, ease: 'power3.out', overwrite: 'auto' })
  }

  const onLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.85, ease: 'expo.out', overwrite: 'auto' })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
