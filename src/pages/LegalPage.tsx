import { useRef } from 'react'
import { legalContent, type LegalDocument } from '../data/legal'
import { studio } from '../data/site'
import { useReveal } from '../animations/reveal'
import { usePageMeta } from '../hooks/usePageMeta'
import { Lines } from '../components/ui/Text'
import { SectionLabel } from '../components/ui/SectionLabel'

export default function LegalPage({ document }: { document: LegalDocument }) {
  const content = legalContent[document]
  usePageMeta(content.title, content.summary)
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, [document])

  return (
    <article ref={ref} aria-labelledby="legal-title" className="bg-obsidian pt-[calc(var(--header-h)+clamp(4rem,10vw,9rem))] pb-[var(--section-y)]">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <SectionLabel index="—" label="Legal" />
            <h1 id="legal-title" className="display mt-8 text-display-lg text-cream">
              <Lines lines={[content.title]} />
            </h1>
            <p data-reveal="fade" className="mt-6 text-sm text-cream/55">
              Last updated {content.updated}
            </p>
            <p data-reveal="fade" className="mt-8 border-l border-gold/50 pl-4 text-sm text-gold/90">
              Template text. {studio.legalName} must have this reviewed by a qualified legal adviser for its jurisdiction before launch.
            </p>
          </div>
        </header>
        <div className="flex max-w-[42rem] flex-col gap-10 lg:col-span-7 lg:col-start-6">
          {content.sections.map((s, i) => (
            <section key={s.heading} data-reveal="fade" aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="display text-display-sm text-cream">
                <span className="mr-3 text-gold">{String(i + 1).padStart(2, '0')}</span>
                {s.heading}
              </h2>
              {s.paragraphs.map((p) => (
                <p key={p} className="mt-4 text-pretty text-cream/75">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
