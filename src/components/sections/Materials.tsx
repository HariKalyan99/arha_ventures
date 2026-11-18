import { useRef, type PointerEvent } from 'react'
import { materialStories } from '../../data/materials'
import { useReveal } from '../../animations/reveal'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import type { MaterialStory } from '../../types/content'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'

/** Asymmetric spans so the library reads like a curated table of samples, not a grid. */
const layout = [
  'md:col-span-7 aspect-[4/3]',
  'md:col-span-5 aspect-[4/5] md:mt-24',
  'md:col-span-4 aspect-[3/4]',
  'md:col-span-4 aspect-[3/4] md:mt-16',
  'md:col-span-4 aspect-[3/4] md:-mt-8',
  'md:col-span-5 aspect-[4/5]',
  'md:col-span-7 aspect-[4/3] md:mt-20',
]

function MaterialTile({ item, index, className }: { item: MaterialStory; index: number; className: string }) {
  const tile = useRef<HTMLDivElement>(null)
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const tilt = finePointer && !reduced

  // Lightweight dimensional feel with CSS 3D transforms — no WebGL needed here.
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tile.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1100px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg)`
    el.style.setProperty('--glare-x', `${(px + 0.5) * 100}%`)
    el.style.setProperty('--glare-y', `${(py + 0.5) * 100}%`)
  }
  const onLeave = () => {
    if (tile.current) tile.current.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)'
  }

  return (
    <figure data-reveal="fade" data-delay={(index % 3) * 0.08} className={`group flex flex-col gap-4 ${className.replace(/aspect-\S+/, '')}`}>
      <div
        ref={tile}
        onPointerMove={tilt ? onMove : undefined}
        onPointerLeave={tilt ? onLeave : undefined}
        className={`relative overflow-hidden bg-espresso transition-transform duration-500 ease-out will-change-transform ${className.match(/aspect-\S+/)?.[0] ?? ''}`}
      >
        <Img
          media={item.image}
          className="size-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
          sizes="(min-width: 768px) 45vw, 100vw"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle at var(--glare-x,50%) var(--glare-y,50%), rgba(232,223,208,0.16), transparent 55%)' }}
        />
        <span className="eyebrow absolute top-4 left-4 bg-obsidian/70 px-2 py-1 text-gold backdrop-blur-sm">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <figcaption className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-baseline">
        <h3 className="display text-display-sm text-cream">{item.name}</h3>
        <p className="eyebrow text-gold-soft">{item.finishes}</p>
        <p className="max-w-md text-sm text-cream/65 sm:col-span-2">{item.note}</p>
      </figcaption>
    </figure>
  )
}

export function Materials({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const names = materialStories.map((m) => m.name)

  return (
    <section ref={ref} aria-labelledby="materials-title" className="relative overflow-hidden bg-ink section-y">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionLabel index={index} label="Materials & Craft" />
            <h2 id="materials-title" className="display mt-8 text-display-xl text-cream">
              <Lines lines={['Detail is where', <><em>trust</em> is built.</>]} />
            </h2>
          </div>
          <p data-reveal="fade" className="text-cream/75 lg:col-span-4 lg:col-start-9">
            We select every surface in person — at the quarry, the sawmill and the weaver’s loom — and work with makers who share our patience.
          </p>
        </div>
      </div>

      <div aria-hidden className="my-[clamp(3rem,6vw,5rem)] overflow-hidden border-y border-line py-6">
        <div className="animate-marquee flex w-max motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {names.map((n) => (
                <span key={n} className="flex items-center font-display text-[clamp(2.2rem,5vw,4.5rem)] font-light text-cream/25 italic">
                  <span className="px-8">{n}</span>
                  <span className="size-2 rotate-45 bg-gold/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="shell grid gap-x-8 gap-y-16 md:grid-cols-12">
        {materialStories.map((item, i) => (
          <MaterialTile key={item.id} item={item} index={i} className={layout[i % layout.length]} />
        ))}
      </div>
    </section>
  )
}
