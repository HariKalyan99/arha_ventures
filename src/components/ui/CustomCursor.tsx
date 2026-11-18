import { useEffect, useRef, useState } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

type CursorMode = 'default' | 'hover' | 'grab' | 'grabbing' | 'hidden'

function modeFromTarget(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return 'default'
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return 'hidden'
  if (target.closest('.cursor-grabbing')) return 'grabbing'
  if (target.closest('.cursor-grab')) return 'grab'
  if (
    target.closest(
      'a, button, label, summary, [role="button"], [role="link"], .link-line, [data-cursor="hover"]',
    )
  ) {
    return 'hover'
  }
  return 'default'
}

/**
 * Dual-ring atelier cursor — cream/gold dot + lagging hairline ring.
 * Fine-pointer + motion only; native cursor restored for form fields.
 */
export function CustomCursor() {
  const fine = useFinePointer()
  const reducedMotion = usePrefersReducedMotion()
  const enabled = fine && !reducedMotion
  const [mode, setMode] = useState<CursorMode>('default')
  const [visible, setVisible] = useState(false)
  const dot = useRef<HTMLSpanElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const pos = useRef({ x: 0, y: 0, rx: 0, ry: 0 })
  const pressed = useRef(false)
  const raf = useRef(0)

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('has-custom-cursor')
      return
    }
    document.documentElement.classList.add('has-custom-cursor')
    return () => document.documentElement.classList.remove('has-custom-cursor')
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const resolve = (target: EventTarget | null) => {
      const next = modeFromTarget(target)
      if (pressed.current && next === 'grab') return 'grabbing' as const
      return next
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.current.x = e.clientX
      pos.current.y = e.clientY
      setVisible(true)
      setMode(resolve(e.target))
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pressed.current = true
      setMode(resolve(e.target))
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pressed.current = false
      setMode(resolve(e.target))
    }
    const onLeave = () => {
      pressed.current = false
      setVisible(false)
    }
    const onEnter = () => setVisible(true)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    const tick = () => {
      const p = pos.current
      p.rx += (p.x - p.rx) * 0.18
      p.ry += (p.y - p.ry) * 0.18
      if (dot.current) {
        dot.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0) translate(-50%, -50%)`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [enabled])

  if (!enabled) return null

  const hovering = mode === 'hover'
  const grabbing = mode === 'grabbing' || mode === 'grab'
  const show = visible && mode !== 'hidden'

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[120] hidden lg:block ${show ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
    >
      <span
        ref={dot}
        className={`absolute top-0 left-0 rounded-full bg-gold-soft will-change-transform ${
          hovering ? 'size-2.5' : grabbing ? 'size-1.5' : 'size-1.5'
        } transition-[width,height,background-color] duration-300 ease-[var(--ease-luxe)]`}
        style={{ boxShadow: hovering ? '0 0 0 1px rgb(180 154 115 / 0.35)' : undefined }}
      />
      <span
        ref={ring}
        className={`absolute top-0 left-0 rounded-full border will-change-transform transition-[width,height,border-color,opacity] duration-500 ease-[var(--ease-luxe)] ${
          hovering
            ? 'size-12 border-gold/70 opacity-100'
            : grabbing
              ? 'size-9 border-cream/35 opacity-90'
              : 'size-7 border-gold/45 opacity-80'
        }`}
      />
    </div>
  )
}
