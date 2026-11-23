import { useRef } from 'react'
import { filmClips } from '../../data/films'
import { useReveal } from '../../animations/reveal'
import { VideoAccordion } from '../bencho/video-accordion/VideoAccordion'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'

/** Site film — curated walkthrough clips between Voices and the Footer enquire. */
export function SiteFilm({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} aria-labelledby="film-title" className="relative surface-ink section-y">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel index={index} label="On site" className="justify-center" />
          <h2 id="film-title" className="display mt-6 text-display-lg text-cream">
            <Lines lines={['As', <em>built.</em>]} />
          </h2>
          <p data-reveal="fade" className="mx-auto mt-5 max-w-md text-cream/55">
            Finished moments from recent projects — hover a panel to open one.
          </p>
        </div>
      </div>

      <div data-reveal="fade" className="mt-[clamp(2.5rem,5vw,4rem)]">
        <VideoAccordion clips={filmClips} />
      </div>
    </section>
  )
}
