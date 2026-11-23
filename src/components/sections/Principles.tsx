import { useRef } from 'react'
import { company } from '../../data/site'
import { useReveal } from '../../animations/reveal'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'

/** Vision, mission and core values — the client’s own wording. */
export function Principles() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} aria-labelledby="principles-title" className="bg-obsidian section-y">
      <div className="shell">
        <SectionLabel index="02" label="Purpose" />
        <h2 id="principles-title" className="display mt-8 max-w-3xl text-display-lg text-cream">
          <Lines lines={['What guides', <em key="e">every project.</em>]} />
        </h2>

        <div className="mt-[clamp(3rem,6vw,5rem)] grid gap-12 border-t border-line pt-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal="fade">
            <h3 className="eyebrow text-gold">Our Vision</h3>
            <p className="mt-4 max-w-xl text-lead text-cream/90">{company.vision}</p>
          </div>
          <div data-reveal="fade" data-delay={0.08}>
            <h3 className="eyebrow text-gold">Our Mission</h3>
            <p className="mt-4 max-w-xl text-lead text-cream/90">{company.mission}</p>
          </div>
        </div>

        <div className="mt-[clamp(3.5rem,7vw,6rem)]">
          <h3 className="eyebrow text-gold">Our Core Values</h3>
          <ol className="mt-4 grid gap-x-12 sm:grid-cols-2">
            {company.values.map((value, i) => (
              <li key={value.title} data-reveal="fade" data-delay={i * 0.06} className="relative py-8">
                <span data-reveal="rule" aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
                <h4 className="display text-display-sm text-cream">{value.title}</h4>
                <p className="mt-3 max-w-md text-cream/70">{value.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
