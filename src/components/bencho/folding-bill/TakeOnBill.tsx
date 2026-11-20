import { useEffect, useRef, useState } from 'react'
import { FoldingBill } from './FoldingBill'
import './FoldingBill.css'

const BASE_W = 260
const BASE_H = 184
const RATIO = BASE_H / BASE_W
const MIN_W = 96
const EDGE_PAD = 8

/**
 * Preferred bill width vs viewport — eases down as px shrink.
 * 320→104 · 375→122 · 480→155 · 640→205 · 768+→260
 */
function preferredWidth(vw: number) {
  if (vw >= 768) return BASE_W
  if (vw <= 320) return 104
  const t = (vw - 320) / (768 - 320)
  /* ease-out so the drop is noticeable on phones, gentler into md */
  const e = 1 - (1 - t) * (1 - t)
  return Math.round(104 + e * (BASE_W - 104))
}

function sizeFor(vw: number, cap = preferredWidth(vw)) {
  const w = Math.min(BASE_W, Math.max(MIN_W, cap))
  return { w, h: Math.round(w * RATIO) }
}

/**
 * Folding bill laid on the Services “take on.” phrase —
 * grab, drag and fold; canvas spills into the section for play.
 * Size tracks the phrase and the viewport so smaller screens get a smaller bill.
 */
export function TakeOnBill() {
  const root = useRef<HTMLSpanElement>(null)
  const [{ w, h }, setSize] = useState(() =>
    sizeFor(typeof window !== 'undefined' ? window.innerWidth : BASE_W),
  )

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      const fluid = preferredWidth(vw)
      const em = root.current?.querySelector('em')
      if (!em) {
        setSize(sizeFor(vw, fluid))
        return
      }
      const tr = em.getBoundingClientRect()
      if (tr.width < 4) {
        setSize(sizeFor(vw, fluid))
        return
      }
      const center = tr.left + tr.width / 2
      const maxW = Math.floor(2 * Math.min(center - EDGE_PAD, vw - center - EDGE_PAD))
      /* Never exceed the fluid viewport cap — bill shrinks with lesser px */
      const next = Math.min(fluid, Math.max(MIN_W, maxW))
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
