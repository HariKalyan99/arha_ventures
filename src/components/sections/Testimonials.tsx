import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, SquareArrowOutUpRight } from 'lucide-react'
import { googleReviews, studio } from '../../data/site'
import { testimonials } from '../../data/testimonials'
import { EASE_LUXE } from '../../lib/motion'
import { useReveal } from '../../animations/reveal'
import { SectionLabel } from '../ui/SectionLabel'

const STAR_PATH =
  'M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'

/** Five stars with a true partial fill (e.g. 4.7 → four full + 70% fifth). */
function GoogleStars({ rating }: { rating: number }) {
  const uid = useId()
  return (
    <span
      className="google-stars inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i))
        const clipId = `${uid}-clip-${i}`
        return (
          <svg key={i} viewBox="0 0 24 24" className="size-3.5 overflow-visible" aria-hidden>
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={24 * fill} height="24" />
              </clipPath>
            </defs>
            {/* Empty track — clear contrast so a partial star reads as fractional */}
            <path className="fill-stone/35" d={STAR_PATH} />
            {fill > 0 && (
              <path
                className="google-star-fill"
                style={{ ['--star-i' as string]: i }}
                clipPath={`url(#${clipId})`}
                d={STAR_PATH}
              />
            )}
          </svg>
        )
      })}
    </span>
  )
}

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

          {/* Google Business–style rating summary */}
          <div className="max-w-56 border-l border-gold/50 pl-4">
            <p className="font-display text-[1.15rem] leading-snug tracking-[-0.01em] text-cream">{studio.legalName}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-mist">
              <span className="tabular-nums font-medium text-cream">{googleReviews.rating.toFixed(1)}</span>
              <GoogleStars rating={googleReviews.rating} />
              <a
                href={googleReviews.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-gold-soft transition-colors duration-500 hover:text-gold"
              >
                Google reviews
                <SquareArrowOutUpRight className="size-3 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 lg:col-start-5">
          <span aria-hidden className="block font-display text-[clamp(5rem,10vw,9rem)] leading-[0.5] text-gold/70">
            “
          </span>
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
                <figcaption className="mt-10 flex items-center gap-3 text-sm">
                  {item.avatar ? (
                    <span className="reviewer-avatar size-9 shrink-0">
                      <img
                        src={item.avatar.src}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                  ) : (
                    <span aria-hidden className="reviewer-avatar reviewer-avatar--initial size-9 shrink-0">
                      {item.attribution.charAt(0)}
                    </span>
                  )}
                  <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
                    <span className="text-cream">{item.attribution}</span>
                    <span className="text-cream/50">— {item.reference}</span>
                  </div>
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
                  <span
                    className={`block h-px transition-all duration-700 ${i === current ? 'w-12 bg-gold' : 'w-6 bg-cream/30 group-hover:bg-cream/60'}`}
                  />
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
