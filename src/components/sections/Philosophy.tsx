import { useRef } from 'react'
import { media } from '../../data/media'
import { useReveal } from '../../animations/reveal'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { Words } from '../ui/Text'
import { ArrowLink } from '../ui/ArrowButton'

export function Philosophy() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} id="intro" aria-labelledby="studio-title" className="relative surface-obsidian section-y">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel index="01" label="The Studio" />
          </div>
          <div className="lg:col-span-9">
            <h2 id="studio-title" className="sr-only">
              Studio philosophy
            </h2>
            <Words
              className="display text-display-lg text-balance text-cream"
              text="Architecture is the art of restraint. We shape interiors where light, material and proportion are allowed to speak — and nothing else needs to."
              emphasis={['light', 'material', 'proportion']}
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
                ARHA is an architecture and interior design studio working across private residences, villas and hospitality.
              </p>
              <p data-reveal="fade">
                We work with a small number of clients at a time, from the first site visit to the day the last piece of furniture is placed —
                designing the architecture, the interior and the objects within it as one continuous idea.
              </p>
              <dl data-reveal="fade" className="mt-2 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6">
                {[
                  ['Disciplines', 'Architecture · Interiors'],
                  ['Also', 'Furniture · Lighting'],
                  ['Scale', 'Apartments to resorts'],
                  ['Approach', 'Concept to handover'],
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
    </section>
  )
}
