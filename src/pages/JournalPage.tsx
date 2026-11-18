import { useRef } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '../components/ui/PageHeader'
import { Img } from '../components/ui/Img'
import { formatDate, journal } from '../data/journal'
import { useReveal } from '../animations/reveal'
import { usePageMeta } from '../hooks/usePageMeta'

export default function JournalPage() {
  usePageMeta('Journal', 'Notes on materials, light and the craft of making rooms.')
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const [lead, ...rest] = journal

  return (
    <>
      <PageHeader
        index="01"
        label="Journal"
        title={['Notes on', <>material <em>and light.</em></>]}
        intro="Occasional writing from the studio on how rooms are made — the materials we return to and the decisions behind them."
        aside={journal.some((j) => j.sample) && <p className="eyebrow text-gold/80">Sample articles — to be replaced with the studio’s own writing</p>}
      />
      <section ref={ref} aria-label="Articles" className="bg-obsidian pb-[var(--section-y)]">
        <div className="shell flex flex-col gap-[clamp(4rem,8vw,7rem)]">
          <Link to={`/journal/${lead.slug}`} className="group grid items-end gap-8 lg:grid-cols-12">
            <div data-reveal="image" className="overflow-hidden lg:col-span-8">
              <div className="aspect-[16/10] overflow-hidden">
                <Img
                  media={lead.cover}
                  className="size-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 66vw, 100vw"
                />
              </div>
            </div>
            <div data-reveal="fade" className="lg:col-span-4">
              <p className="eyebrow text-gold">
                {lead.category} · <time dateTime={lead.date}>{formatDate(lead.date)}</time>
              </p>
              <h2 className="display mt-4 text-display-md text-cream transition-colors duration-500 group-hover:text-gold-soft">{lead.title}</h2>
              <p className="mt-4 text-cream/70">{lead.excerpt}</p>
              <p className="eyebrow mt-6 text-cream/50">{lead.readTime}</p>
            </div>
          </Link>

          <ul className="grid gap-x-10 gap-y-16 border-t border-line pt-[clamp(3rem,6vw,5rem)] md:grid-cols-2">
            {rest.map((entry, i) => (
              <li key={entry.slug} data-reveal="fade" className={i % 2 ? 'md:mt-24' : ''}>
                <Link to={`/journal/${entry.slug}`} className="group flex flex-col gap-6">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Img
                      media={entry.cover}
                      className="size-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
                      sizes="(min-width: 768px) 45vw, 100vw"
                    />
                  </div>
                  <div>
                    <p className="eyebrow text-gold">
                      {entry.category} · <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                    </p>
                    <h2 className="display mt-3 text-display-sm text-cream transition-colors duration-500 group-hover:text-gold-soft">{entry.title}</h2>
                    <p className="mt-3 max-w-md text-cream/70">{entry.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
