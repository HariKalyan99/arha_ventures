import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { testimonials } from '../../data/testimonials'
import { EASE_LUXE } from '../../lib/motion'
import { useReveal } from '../../animations/reveal'
import { SectionLabel } from '../ui/SectionLabel'

export function Testimonials({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  useReveal(ref)
  const item = testimonials[current]

  const go = (step: number) => {
    setDirection(step)
    setCurrent((c) => (c + step + testimonials.length) % testimonials.length)
  }

  return (
    <section ref={ref} aria-labelledby="voices-title" aria-roledescription="carousel" className="relative surface-obsidian section-y">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-10 lg:col-span-3">
          <div>
            <SectionLabel index={index} label="Voices" />
            <h2 id="voices-title" className="sr-only">
              Client voices
            </h2>
          </div>
          {item.sample && (
            <p className="eyebrow max-w-52 border-l border-gold/50 pl-4 text-[0.62rem] leading-relaxed text-gold/90">
              Placeholder testimonials — to be replaced with verified client feedback
            </p>
          )}
        </div>

        <div className="lg:col-span-8 lg:col-start-5">
          <span aria-hidden className="block font-display text-[clamp(5rem,10vw,9rem)] leading-[0.5] text-gold/70">“</span>
          <div className="relative min-h-[16rem] sm:min-h-[14rem]" aria-live="polite">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.figure
                key={item.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.8, ease: EASE_LUXE }}
                aria-roledescription="slide"
                aria-label={`${current + 1} of ${testimonials.length}`}
              >
                <blockquote className="display text-display-md text-balance text-cream">{item.quote}</blockquote>
                <figcaption className="mt-10 flex items-center gap-4 text-sm">
                  <span aria-hidden className="h-px w-10 bg-gold" />
                  <span className="text-cream">{item.attribution}</span>
                  <span className="text-cream/50">— {item.reference}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-line pt-6">
            <div className="flex gap-3" role="group" aria-label="Choose testimonial">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Show testimonial ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1)
                    setCurrent(i)
                  }}
                  className="group flex min-h-11 items-center"
                >
                  <span className={`block h-px transition-all duration-700 ${i === current ? 'w-12 bg-gold' : 'w-6 bg-cream/30 group-hover:bg-cream/60'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="flex size-12 items-center justify-center border border-line text-cream transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                <ArrowLeft className="size-4" strokeWidth={1.25} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="flex size-12 items-center justify-center border border-line text-cream transition-colors duration-500 hover:border-gold hover:text-gold"
              >
                <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
