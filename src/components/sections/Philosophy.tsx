import { useRef } from 'react'
import { ThemeLogo } from '../ui/ThemeLogo'
import { media } from '../../data/media'
import { company, studio } from '../../data/site'
import { useReveal } from '../../animations/reveal'
import { gsap, MOTION_QUERY, useGSAP } from '../../lib/gsap'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { Words } from '../ui/Text'
import { ArrowLink } from '../ui/ArrowButton'

export function Philosophy() {
  const ref = useRef<HTMLElement>(null)
  const decal = useRef<HTMLDivElement>(null)
  useReveal(ref)

  // Rise into a sticky bottom decal — large mark, partially emerging from the fold.
  useGSAP(
    () => {
      if (!ref.current || !decal.current) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_QUERY, () => {
        gsap.fromTo(
          decal.current,
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 42,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 75%',
              end: 'center 45%',
              scrub: 1.1,
            },
          },
        )
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(decal.current, { yPercent: 42, autoAlpha: 0.9 })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} id="intro" aria-labelledby="studio-title" className="relative surface-obsidian section-y">
      <div className="shell relative z-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel index="01" label="The Studio" />
          </div>
          <div className="lg:col-span-9">
            <h2 id="studio-title" className="sr-only">
              About ARHA Ventures
            </h2>
            <Words
              className="display text-display-lg text-balance text-cream"
              text={company.belief}
              emphasis={['inspire', 'connect', 'time']}
            />
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,10rem)] grid gap-12 lg:grid-cols-12 lg:gap-8">
          <figure className="relative lg:col-span-7">
            <div data-reveal="image" className="frame-ticks media-grade overflow-hidden">
              <div className="aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[6/5]">
                <div data-parallax="6" className="h-[112%] -translate-y-[6%]">
                  <Img media={media['living-wood-stone']} className="size-full object-cover" sizes="(min-width: 1024px) 58vw, 100vw" />
                </div>
              </div>
            </div>
            <figcaption className="eyebrow mt-4 flex justify-between text-cream/40">
              <span>Timber, stone & glass</span>
              <span>Sample imagery</span>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-12 lg:col-span-4 lg:col-start-9 lg:pt-40">
            <div data-reveal="image" className="media-grade w-3/5 overflow-hidden self-end lg:self-start">
              <div className="aspect-[3/4]">
                <Img media={media['vessels']} className="size-full object-cover" sizes="(min-width: 1024px) 20vw, 60vw" />
              </div>
            </div>
            <div className="flex flex-col gap-6 text-cream/60">
              <p data-reveal="fade" className="text-lead text-cream/90">
                {company.paragraphs[0]}
              </p>
              <p data-reveal="fade">{company.paragraphs[1]}</p>
              <dl data-reveal="fade" className="mt-2 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6">
                {[
                  ['Practice', 'Construction · Interiors'],
                  ['Services', 'Planning · Turnkey'],
                  ['Approach', 'Design · Craft · Detail'],
                  ['Delivery', 'Transparent · On time'],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="eyebrow text-gold">{term}</dt>
                    <dd className="mt-2 text-sm text-cream/65">{value}</dd>
                  </div>
                ))}
              </dl>
              <ArrowLink to="/studio" variant="ghost" className="self-start">
                About the studio
              </ArrowLink>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom decal — rises in, then sits partially out of the viewport */}
      <div className="pointer-events-none sticky bottom-0 z-[5] -mb-[1px] flex justify-center overflow-visible pt-6 sm:pt-8">
        <div
          ref={decal}
          className="will-change-transform"
          style={{ opacity: 0 }}
          aria-hidden
        >
          <ThemeLogo
            width={700}
            height={620}
            decoding="async"
            className="h-auto w-[min(92vw,34rem)] max-w-none object-contain object-bottom opacity-90 drop-shadow-[0_18px_36px_rgba(42,34,30,0.12)] sm:w-[min(80vw,40rem)] lg:w-[min(62vw,44rem)]"
          />
          <span className="sr-only">{studio.name}</span>
        </div>
      </div>
    </section>
  )
}
