import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { processStages } from '../../data/process'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { EASE_LUXE } from '../../lib/motion'
import { useReveal } from '../../animations/reveal'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'

/**
 * Scroll-driven process timeline. Each stage activates as it crosses the middle
 * of the viewport; the sticky panel (desktop) follows with numeral and image.
 */
export function Process({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null)
  const line = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  useReveal(ref)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-stage]').forEach((stage, i) => {
        ScrollTrigger.create({
          trigger: stage,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        })
      })
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-stages]', start: 'top 55%', end: 'bottom 55%', scrub: true } },
      )
    },
    { scope: ref },
  )

  const stage = processStages[active]

  return (
    <section ref={ref} aria-labelledby="process-title" className="relative bg-obsidian section-y">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index={index} label="Process" />
            <h2 id="process-title" className="display mt-8 text-display-xl text-cream">
              <Lines lines={['Seven movements,', <><em>one</em> continuous line.</>]} />
            </h2>
          </div>
          <p data-reveal="fade" className="text-cream/75 lg:col-span-4">
            A clear sequence from first conversation to final handover, with the same team accountable at every step.
          </p>
        </div>

        <div className="mt-[clamp(4rem,8vw,7rem)] grid gap-12 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(var(--header-h)+3rem)] flex flex-col gap-8">
              <div className="flex items-end justify-between">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: '60%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-60%', opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE_LUXE }}
                    className="font-display text-[clamp(6rem,11vw,11rem)] leading-[0.8] font-light text-gold"
                  >
                    {String(active + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <span className="eyebrow pb-3 text-cream/50">/ {String(processStages.length).padStart(2, '0')}</span>
              </div>
              <div className="relative aspect-[5/4] overflow-hidden bg-espresso">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={stage.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: EASE_LUXE }}
                  >
                    <Img media={stage.image} className="size-full object-cover" sizes="40vw" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <ol data-stages className="relative lg:col-span-6 lg:col-start-7">
            <span aria-hidden className="absolute top-0 bottom-0 left-0 w-px bg-line" />
            <span ref={line} aria-hidden className="absolute top-0 bottom-0 left-0 w-px origin-top bg-gold" />
            {processStages.map((s, i) => (
              <li key={s.id} data-stage aria-current={active === i ? 'step' : undefined} className="relative pb-16 pl-8 sm:pl-12 lg:min-h-[52vh] lg:pb-24">
                <span
                  aria-hidden
                  className={`absolute top-2 -left-[4.5px] size-2.5 rotate-45 border transition-colors duration-700 ${
                    active >= i ? 'border-gold bg-gold' : 'border-cream/30 bg-obsidian'
                  }`}
                />
                <p className="eyebrow text-gold lg:hidden">{String(i + 1).padStart(2, '0')}</p>
                <h3
                  className={`display mt-2 text-display-md transition-colors duration-700 lg:mt-0 ${active === i ? 'text-cream' : 'text-cream/70 lg:text-cream/35'}`}
                >
                  {s.title}
                </h3>
                <p className="mt-5 max-w-md text-cream/70">{s.summary}</p>
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  {s.deliverables.map((d) => (
                    <li key={d} className="eyebrow flex items-center gap-2 text-cream/60">
                      <span aria-hidden className="size-1 rotate-45 bg-gold" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 aspect-[16/10] overflow-hidden lg:hidden">
                  <Img media={s.image} className="size-full object-cover" sizes="90vw" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
