import { useRef } from 'react'
import { useReveal } from '../animations/reveal'
import { PageHeader } from '../components/ui/PageHeader'
import { Principles } from '../components/sections/Principles'
import { Materials } from '../components/sections/Materials'
import { Testimonials } from '../components/sections/Testimonials'
import { company } from '../data/site'
import { media } from '../data/media'
import { usePageMeta } from '../hooks/usePageMeta'

export default function StudioPage() {
  const statement = useRef<HTMLElement>(null)
  usePageMeta('Studio', company.paragraphs[0])
  useReveal(statement)
  return (
    <>
      <PageHeader
        index="01"
        label="The Studio"
        title={['Design-driven', <>construction & <em>interiors.</em></>]}
        intro={company.paragraphs[0]}
        aside={<p>{company.paragraphs[1]}</p>}
        image={media['living-wood-stone']}
      />
      <section ref={statement} aria-label="How we work" className="bg-obsidian">
        <div className="shell section-y">
          <p className="display max-w-4xl text-display-md text-balance text-cream">{company.belief}</p>
          <div className="mt-10 flex max-w-2xl flex-col gap-6 text-cream/70">
            <p data-reveal="fade">{company.paragraphs[2]}</p>
            <p data-reveal="fade">{company.paragraphs[3]}</p>
          </div>
        </div>
      </section>
      <Principles />
      <Materials index="03" />
      <Testimonials index="04" />
    </>
  )
}
