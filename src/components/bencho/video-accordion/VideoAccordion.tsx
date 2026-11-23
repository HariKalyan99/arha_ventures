import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { FilmClip } from '../../../data/films'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

/** Bencho Image Accordion defaults — calm editorial row. */
const OPEN = 0.42
const REACH = 0.35
const GAP_PX = 8
const BOUNCE = 0.1

/** Visible panels: 5 below md, 6 at md, 7 above md (lg+). */
const COUNT_MOBILE = 5
const COUNT_MD = 6
const COUNT_LG = 7

type Props = {
  clips: FilmClip[]
  className?: string
}

/**
 * Portrait video row: hover (or tap) opens a panel wide while neighbours yield.
 * Only the open clip plays — muted, looped, playsInline.
 */
export function VideoAccordion({ clips, className = '' }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const [coarse, setCoarse] = useState(false)
  /** Bytes stay off the wire until the row is near — posters paint the panels first. */
  const [near, setNear] = useState(false)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const row = useRef<HTMLDivElement>(null)

  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const visible = useMemo(() => {
    const n = isLg ? COUNT_LG : isMd ? COUNT_MD : COUNT_MOBILE
    return clips.slice(0, Math.min(n, clips.length))
  }, [clips, isLg, isMd])

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setOpen((prev) => (prev !== null && prev >= visible.length ? null : prev))
  }, [visible.length])

  useEffect(() => {
    const el = row.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        io.disconnect()
      },
      { rootMargin: '720px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    videos.current.forEach((el, i) => {
      if (!el) return
      if (i === open) {
        const play = el.play()
        if (play && typeof play.catch === 'function') play.catch(() => {})
      } else {
        el.pause()
        try {
          el.currentTime = 0
        } catch {
          /* ignore seek on unloaded */
        }
      }
    })
  }, [open, visible, near])

  const flexFor = useCallback(
    (index: number) => {
      const n = visible.length
      if (n === 0) return 1
      if (open === null) return 1

      const closedShare = (1 - OPEN) / (n - 1)
      if (index === open) return OPEN * 100

      const dist = Math.abs(index - open)
      const pull = 1 - REACH * (1 - Math.min(1, dist / Math.max(1, n - 1)))
      return Math.max(0.35, closedShare * pull * 100)
    },
    [visible.length, open],
  )

  const spring = {
    type: 'spring' as const,
    stiffness: 120 + BOUNCE * 40,
    damping: 22 - BOUNCE * 8,
    mass: 0.85,
  }

  return (
    <div
      ref={row}
      className={`mx-auto flex h-[min(72vh,36rem)] w-[92vw] max-w-[90rem] md:h-[min(70vh,36rem)] md:w-[85vw] lg:w-[80vw] ${className}`}
      style={{ gap: GAP_PX }}
      onMouseLeave={() => {
        if (!coarse) setOpen(null)
      }}
    >
      {visible.map((clip, i) => {
        const isOpen = open === i
        return (
          <motion.button
            key={clip.id}
            type="button"
            aria-label={`${clip.space} — ${clip.label}`}
            aria-pressed={isOpen}
            className="relative min-w-0 overflow-hidden rounded-2xl border border-line/60 bg-espresso text-left outline-none focus-visible:ring-1 focus-visible:ring-gold"
            initial={false}
            animate={{ flexGrow: flexFor(i) }}
            transition={spring}
            style={{ flexBasis: 0, flexShrink: 1 }}
            onMouseEnter={() => {
              if (!coarse) setOpen(i)
            }}
            onFocus={() => setOpen(i)}
            onClick={() => {
              if (coarse) setOpen((prev) => (prev === i ? null : i))
            }}
          >
            <img
              src={clip.poster}
              alt=""
              width={640}
              height={1138}
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <video
              ref={(el) => {
                videos.current[i] = el
              }}
              src={near ? clip.src : undefined}
              poster={clip.poster}
              muted
              loop
              playsInline
              preload={near ? 'auto' : 'none'}
              onLoadedData={(e) => {
                e.currentTarget.dataset.ready = 'true'
              }}
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 data-[ready=true]:opacity-100"
            />
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111111]/55 via-transparent to-[#111111]/15 transition-opacity duration-700 ease-[var(--ease-luxe)] ${
                isOpen ? 'opacity-40' : 'opacity-70'
              }`}
            />
            <span
              className={`pointer-events-none absolute inset-x-0 bottom-0 p-3 transition-[opacity,transform] duration-700 ease-[var(--ease-luxe)] sm:p-4 ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
              }`}
            >
              <span className="eyebrow block text-gold/90">{clip.space}</span>
              <span className="display mt-1 block text-[clamp(1rem,0.85rem+0.6vw,1.35rem)] leading-tight text-parchment">
                {clip.label}
              </span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
