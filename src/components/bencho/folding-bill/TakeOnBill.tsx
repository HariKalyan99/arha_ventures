import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const e = 1 - (1 - t) * (1 - t)
  return Math.round(104 + e * (BASE_W - 104))
}

function sizeFor(vw: number, cap = preferredWidth(vw)) {
  const w = Math.min(BASE_W, Math.max(MIN_W, cap))
  return { w, h: Math.round(w * RATIO) }
}

type Anchor = {
  left: number
  top: number
  spill: number
  ready: boolean
}

/**
 * Folding bill on the Services “take on.” phrase.
 * The WebGL playfield is portaled onto `[data-bill-stage]` (the Services
 * section) so the sheet is not clipped by the headline cell — you can
 * drag it freely across that section.
 */
export function TakeOnBill() {
  const root = useRef<HTMLSpanElement>(null)
  const stageRef = useRef<HTMLElement | null>(null)
  const [{ w, h }, setSize] = useState(() =>
    sizeFor(typeof window !== 'undefined' ? window.innerWidth : BASE_W),
  )
  const [anchor, setAnchor] = useState<Anchor>({ left: 0, top: 0, spill: 7, ready: false })
  const [, setStageTick] = useState(0)

  useLayoutEffect(() => {
    const phrase = root.current
    if (!phrase) return
    const stage = phrase.closest('[data-bill-stage]') as HTMLElement | null
    stageRef.current = stage
    setStageTick((n) => n + 1)
  }, [])

  useEffect(() => {
    const sync = () => {
      const vw = window.innerWidth
      const fluid = preferredWidth(vw)
      const phrase = root.current
      const em = phrase?.querySelector('em')
      const stage = (stageRef.current ?? phrase?.closest('[data-bill-stage]')) as HTMLElement | null
      stageRef.current = stage

      let nextW = sizeFor(vw, fluid).w
      if (em) {
        const tr = em.getBoundingClientRect()
        if (tr.width >= 4) {
          const center = tr.left + tr.width / 2
          const maxW = Math.floor(2 * Math.min(center - EDGE_PAD, vw - center - EDGE_PAD))
          nextW = Math.min(fluid, Math.max(MIN_W, maxW))
        }
      }
      const nextH = Math.round(nextW * RATIO)
      setSize((prev) => (prev.w === nextW ? prev : { w: nextW, h: nextH }))

      if (!phrase || !stage) {
        setAnchor((a) => (a.ready ? { ...a, ready: false } : a))
        return
      }

      const pr = phrase.getBoundingClientRect()
      const sr = stage.getBoundingClientRect()
      /* Cover ~viewport-worth of the stage so the sheet can travel freely.
         Cap below lg — oversized spill canvases widen the document on phones/tablets. */
      const cover = Math.max(sr.width / Math.max(nextW, 1), Math.min(sr.height, vw * 1.2) / Math.max(nextH, 1))
      const spill =
        vw < 1024
          ? Math.round(Math.min(2.4, Math.max(1.6, cover * 0.35)) * 10) / 10
          : Math.round(Math.min(10, Math.max(7, cover)) * 10) / 10

      const left = pr.left - sr.left + pr.width / 2
      const top = pr.top - sr.top + pr.height / 2
      setAnchor((prev) => {
        if (
          prev.ready &&
          Math.abs(prev.left - left) < 0.5 &&
          Math.abs(prev.top - top) < 0.5 &&
          prev.spill === spill
        ) {
          return prev
        }
        return { left, top, spill, ready: true }
      })
    }

    sync()
    const raf = requestAnimationFrame(sync)
    void document.fonts?.ready?.then(sync)
    window.addEventListener('resize', sync)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', sync)
    }
  }, [w])

  const stage = stageRef.current

  return (
    <>
      <span ref={root} className="relative z-0 inline-block align-baseline leading-[1.05]">
        <em className="text-cream">take on.</em>
      </span>
      {stage &&
        anchor.ready &&
        createPortal(
          <div
            className="pointer-events-none absolute z-30"
            style={{
              left: anchor.left,
              top: anchor.top,
              width: w,
              height: h,
              transform: 'translate(-50%, -48%)',
            }}
            aria-hidden
          >
            {/* Hits live on the resting box; the spill canvas is paint-only. */}
            <div className="pointer-events-auto size-full">
              <FoldingBill
                key={w}
                print="Plain"
                stiffness={40}
                settle={0}
                width={w}
                height={h}
                spill={anchor.spill}
                reach={3.8}
              />
            </div>
          </div>,
          stage,
        )}
    </>
  )
}
