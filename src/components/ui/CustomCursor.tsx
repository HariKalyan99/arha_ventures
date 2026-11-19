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
 * Architectural crosshair cursor — centre + with lagging L-corner ticks.
 * On interactive targets the ticks open into a small frame. Fine-pointer only.
 */
export function CustomCursor() {
  const fine = useFinePointer()
  const reducedMotion = usePrefersReducedMotion()
  const enabled = fine && !reducedMotion
  const [mode, setMode] = useState<CursorMode>('default')
  const [visible, setVisible] = useState(false)
  const cross = useRef<HTMLSpanElement>(null)
  const frame = useRef<HTMLSpanElement>(null)
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
      p.rx += (p.x - p.rx) * 0.2
      p.ry += (p.y - p.ry) * 0.2
      if (cross.current) {
        cross.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`
      }
      if (frame.current) {
        frame.current.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0) translate(-50%, -50%)`
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
  const tick = 'absolute bg-terracotta-soft'
  const corner = hovering
    ? 'opacity-100'
    : grabbing
      ? 'opacity-70'
      : 'opacity-80'

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[120] hidden lg:block ${show ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
    >
      {/* Centre crosshair — tracks 1:1 */}
      <span ref={cross} className="absolute top-0 left-0 size-4 will-change-transform">
        <span
          className={`${tick} top-1/2 left-0 h-px w-full -translate-y-1/2 transition-opacity duration-300 ${
            hovering ? 'opacity-40' : 'opacity-90'
          }`}
        />
        <span
          className={`${tick} top-0 left-1/2 h-full w-px -translate-x-1/2 transition-opacity duration-300 ${
            hovering ? 'opacity-40' : 'opacity-90'
          }`}
        />
        <span className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta" />
      </span>

      {/* Lagging L-corner ticks — open into a frame on hover */}
      <span
        ref={frame}
        className={`absolute top-0 left-0 will-change-transform transition-[width,height] duration-500 ease-[var(--ease-luxe)] ${
          hovering ? 'size-11' : grabbing ? 'size-8' : 'size-5'
        }`}
      >
        <span className={`${tick} ${corner} top-0 left-0 h-px w-2.5 transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'w-3.5' : ''}`} />
        <span className={`${tick} ${corner} top-0 left-0 h-2.5 w-px transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'h-3.5' : ''}`} />
        <span className={`${tick} ${corner} top-0 right-0 h-px w-2.5 transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'w-3.5' : ''}`} />
        <span className={`${tick} ${corner} top-0 right-0 h-2.5 w-px transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'h-3.5' : ''}`} />
        <span className={`${tick} ${corner} bottom-0 left-0 h-px w-2.5 transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'w-3.5' : ''}`} />
        <span className={`${tick} ${corner} bottom-0 left-0 h-2.5 w-px transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'h-3.5' : ''}`} />
        <span className={`${tick} ${corner} right-0 bottom-0 h-px w-2.5 transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'w-3.5' : ''}`} />
        <span className={`${tick} ${corner} right-0 bottom-0 h-2.5 w-px transition-all duration-500 ease-[var(--ease-luxe)] ${hovering ? 'h-3.5' : ''}`} />
      </span>
    </div>
  )
}
