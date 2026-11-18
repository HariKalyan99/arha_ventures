import { useRef } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { formatDate, getJournalEntry, journal } from '../data/journal'
import { useReveal } from '../animations/reveal'
import { usePageMeta } from '../hooks/usePageMeta'
import { Img } from '../components/ui/Img'
import { Lines } from '../components/ui/Text'
import NotFoundPage from './NotFoundPage'

export default function ArticlePage() {
  const { slug = '' } = useParams()
  return getJournalEntry(slug) ? <Article slug={slug} /> : <NotFoundPage />
}

function Article({ slug }: { slug: string }) {
  const entry = getJournalEntry(slug)!
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, [slug])
  usePageMeta(entry.title, entry.excerpt)
  const more = journal.filter((j) => j.slug !== slug).slice(0, 2)

  return (
    <article ref={ref} aria-labelledby="article-title" className="bg-obsidian">
      <header className="shell pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))]">
        <Link to="/journal" className="eyebrow link-line inline-flex items-center gap-2 text-cream/60">
          <ArrowLeft className="size-3.5" strokeWidth={1.25} aria-hidden />
          Journal
        </Link>
        <p data-reveal="fade" className="eyebrow mt-10 flex flex-wrap items-center gap-4 text-gold">
          <span>{entry.category}</span>
          <span aria-hidden className="h-px w-8 bg-gold/60" />
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          <span className="text-cream/50">{entry.readTime}</span>
          {entry.sample && <span className="border border-gold/50 px-2 py-1 text-[0.6rem] text-gold-soft">Sample article</span>}
        </p>
        <h1 id="article-title" className="display mt-8 max-w-[20ch] text-display-xl text-cream">
          <Lines lines={[entry.title]} />
        </h1>
        <p data-reveal="fade" className="mt-8 max-w-2xl text-lead text-cream/75">
          {entry.excerpt}
        </p>
      </header>

      <div className="mt-[clamp(3rem,6vw,5rem)] px-[var(--gutter)]">
        <div data-reveal="image" className="overflow-hidden">
          <div className="aspect-[16/10] overflow-hidden lg:aspect-[21/9]">
            <div data-parallax="7" className="h-[114%] -translate-y-[7%]">
              <Img media={entry.cover} priority className="size-full object-cover" sizes="100vw" />
            </div>
          </div>
        </div>
      </div>

      <div className="shell section-y">
        <div className="mx-auto flex max-w-[40rem] flex-col gap-12">
          {entry.body.map((block, i) => (
            <section key={i} data-reveal="fade" className="flex flex-col gap-5">
              {block.heading && <h2 className="display text-display-sm text-cream">{block.heading}</h2>}
              {block.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className={`text-pretty text-cream/80 ${i === 0 && j === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.2em] first-letter:leading-[0.8] first-letter:text-gold' : ''}`}
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <aside aria-labelledby="more-title" className="border-t border-line">
        <div className="shell section-y">
          <h2 id="more-title" className="eyebrow text-cream/60">
            Further reading
          </h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-2">
            {more.map((m) => (
              <li key={m.slug}>
                <Link to={`/journal/${m.slug}`} className="group grid grid-cols-[7rem_1fr] items-center gap-6 sm:grid-cols-[10rem_1fr]">
                  <div className="aspect-square overflow-hidden">
                    <Img media={m.cover} className="size-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-105" sizes="10rem" />
                  </div>
                  <div>
                    <p className="eyebrow text-gold">{m.category}</p>
                    <p className="display mt-2 text-display-sm text-cream transition-colors duration-500 group-hover:text-gold-soft">{m.title}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </article>
  )
}
