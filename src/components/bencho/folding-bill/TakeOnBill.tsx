import { useEffect, useRef, useState } from 'react'
import { FoldingBill } from './FoldingBill'
import './FoldingBill.css'

const BASE_W = 260
const BASE_H = 184
const RATIO = BASE_H / BASE_W
const MIN_W = 120
const EDGE_PAD = 8

function fallbackSize(vw: number) {
  const w = Math.min(BASE_W, Math.max(MIN_W, Math.round(vw * 0.42)))
  return { w, h: Math.round(w * RATIO) }
}

/**
 * Folding bill laid on the Services “take on.” phrase —
 * grab, drag and fold; canvas spills into the section for play.
 * Size tracks the phrase so a left-aligned headline never pushes the bill off-screen.
 */
export function TakeOnBill() {
  const root = useRef<HTMLSpanElement>(null)
  const [{ w, h }, setSize] = useState(() =>
    fallbackSize(typeof window !== 'undefined' ? window.innerWidth : BASE_W),
  )

  useEffect(() => {
    const update = () => {
      const em = root.current?.querySelector('em')
      if (!em) {
        setSize(fallbackSize(window.innerWidth))
        return
      }
      const tr = em.getBoundingClientRect()
      if (tr.width < 4) {
        setSize(fallbackSize(window.innerWidth))
        return
      }
      const center = tr.left + tr.width / 2
      const maxW = Math.floor(2 * Math.min(center - EDGE_PAD, window.innerWidth - center - EDGE_PAD))
      const next = Math.min(BASE_W, Math.max(MIN_W, maxW))
      setSize((prev) => (prev.w === next ? prev : { w: next, h: Math.round(next * RATIO) }))
    }

    update()
    const raf = requestAnimationFrame(update)
    void document.fonts?.ready?.then(update)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <span ref={root} className="relative z-10 inline-block align-baseline leading-[1.05]">
      <em className="relative z-0 text-cream">take on.</em>
      <span
        className="pointer-events-auto absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[48%]"
        style={{ width: w, height: h }}
        aria-hidden
      >
        <FoldingBill key={w} print="Plain" stiffness={40} settle={0} width={w} height={h} />
      </span>
    </span>
  )
}
