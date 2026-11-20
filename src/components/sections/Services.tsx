import { useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { services } from '../../data/services'
import { EASE_LUXE } from '../../lib/motion'
import { useReveal } from '../../animations/reveal'
import { useFinePointer } from '../../hooks/useMediaQuery'
import { TakeOnBill } from '../bencho/folding-bill/TakeOnBill'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'

interface ServicesProps {
  index: string
  heading?: ReactNode[]
  intro?: string
  footer?: ReactNode
}

const DEFAULT_HEADING: ReactNode[] = ['What we', <TakeOnBill key="take-on" />]

/** Editorial services index: the active service expands and a sticky frame crossfades to its image. */
export function Services({ index, heading = DEFAULT_HEADING, intro, footer }: ServicesProps) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const finePointer = useFinePointer()
  useReveal(ref)
  const current = services[active]
  /* Folding bill spills past its box — don't clip the second headline line */
  const interactiveTakeOn = heading === DEFAULT_HEADING

  return (
    <section
      ref={ref}
      data-bill-stage={interactiveTakeOn ? '' : undefined}
      aria-labelledby="services-title"
      className={`relative isolate surface-espresso section-y ${
        interactiveTakeOn ? 'max-lg:overflow-x-clip lg:overflow-visible' : ''
      }`}
    >
      <div className={`shell ${interactiveTakeOn ? 'max-lg:overflow-x-clip lg:overflow-visible' : ''}`}>
        <div className={`grid gap-10 lg:grid-cols-12 lg:items-end ${interactiveTakeOn ? 'max-lg:overflow-x-clip lg:overflow-visible' : ''}`}>
          <div className={`lg:col-span-7 ${interactiveTakeOn ? 'max-lg:overflow-x-clip lg:overflow-visible' : ''}`}>
            <SectionLabel index={index} label="Services" />
            <h2
              id="services-title"
              className={`display mt-8 text-display-xl text-cream ${interactiveTakeOn ? 'relative z-10 overflow-visible' : ''}`}
            >
              {interactiveTakeOn ? (
                <span className="overflow-visible">
                  <span data-reveal="lines" className="overflow-visible">
                    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                      <span data-line className="block">
                        What we
                      </span>
                    </span>
                  </span>{' '}
                  {/* Phrase only — bill WebGL is portaled onto the section stage. */}
                  <span className="relative inline overflow-visible">
                    <TakeOnBill />
                  </span>
                </span>
              ) : (
                <Lines lines={heading} />
              )}
            </h2>
          </div>
          {intro && (
            <p data-reveal="fade" className="relative z-10 text-cream/60 lg:col-span-4 lg:col-start-9">
              {intro}
            </p>
          )}
        </div>

        <div className="mt-[clamp(3.5rem,7vw,6rem)] grid gap-12 lg:grid-cols-12">
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-[calc(var(--header-h)+2rem)]">
              <div className="frame-ticks media-grade relative aspect-[4/5] overflow-hidden bg-obsidian">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={current.id}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.3 } }}
                    transition={{ duration: 1, ease: EASE_LUXE }}
                  >
                    <motion.div className="size-full" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: EASE_LUXE }}>
                      <Img media={current.image} className="size-full object-cover" sizes="40vw" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <p className="eyebrow mt-4 flex justify-between text-cream/55">
                <span>{String(active + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}</span>
                <span>{current.title}</span>
              </p>
            </div>
          </div>

          <ul className="border-t border-cream/15 lg:col-span-7">
            {services.map((service, i) => {
              const open = active === i
              return (
                <li key={service.id} className="border-b border-cream/15">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`service-${service.id}`}
                      onClick={() => setActive(i)}
                      onPointerEnter={finePointer ? () => setActive(i) : undefined}
                      onFocus={() => setActive(i)}
                      className="group flex w-full items-center gap-5 py-6 text-left sm:py-7"
                    >
                      <span className="eyebrow w-8 shrink-0 text-gold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span
                        className={`display flex-1 text-[clamp(1.6rem,1.1rem+1.9vw,3rem)] leading-tight transition-[color,transform] duration-700 ease-[var(--ease-luxe)] ${
                          open ? 'translate-x-2 text-cream' : 'text-cream/55 group-hover:text-cream/85'
                        }`}
                      >
                        {service.title}
                      </span>
                      <Plus
                        aria-hidden
                        strokeWidth={1.25}
                        className={`size-5 shrink-0 text-gold transition-transform duration-700 ease-[var(--ease-luxe)] ${open ? 'rotate-45' : ''}`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`service-${service.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.7, ease: EASE_LUXE }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-6 pb-8 pl-13 sm:grid-cols-[1fr_auto]">
                          <p className="max-w-md text-cream/75">{service.summary}</p>
                          <ul className="flex flex-wrap gap-2 sm:max-w-56 sm:justify-end">
                            {service.scope.map((s) => (
                              <li key={s} className="eyebrow border border-gold/30 px-2.5 py-1.5 text-[0.62rem] text-gold-soft">
                                {s}
                              </li>
                            ))}
                          </ul>
                          <div className="aspect-[16/10] overflow-hidden sm:col-span-2 lg:hidden">
                            <Img media={service.image} className="size-full object-cover" sizes="90vw" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
        {footer && <div className="mt-8 flex justify-end lg:mt-10">{footer}</div>}
      </div>
    </section>
  )
}
