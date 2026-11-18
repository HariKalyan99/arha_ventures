import { useRef } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getAdjacentProjects, getProject } from '../data/projects'
import { useReveal } from '../animations/reveal'
import { usePageMeta } from '../hooks/usePageMeta'
import { Img } from '../components/ui/Img'
import { ArrowLink } from '../components/ui/ArrowButton'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Lines, Words } from '../components/ui/Text'
import NotFoundPage from './NotFoundPage'

export default function ProjectPage() {
  const { slug = '' } = useParams()
  const project = getProject(slug)
  if (!project) return <NotFoundPage />
  return <ProjectDetail slug={slug} />
}

function ProjectDetail({ slug }: { slug: string }) {
  const project = getProject(slug)!
  const { prev, next } = getAdjacentProjects(slug)
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, [slug])
  usePageMeta(project.title, project.summary)

  const meta = [
    { label: 'Category', value: project.category },
    { label: 'Location', value: project.location },
    { label: 'Year', value: project.year },
    { label: 'Area', value: project.area },
    { label: 'Status', value: project.status },
  ]

  return (
    <article ref={ref} aria-labelledby="project-title">
      {/* Hero */}
      <header className="relative flex h-svh min-h-[34rem] flex-col justify-end overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <div data-parallax="12" className="h-[124%] -translate-y-[12%]">
            <Img media={project.cover} priority className="size-full object-cover" sizes="100vw" />
          </div>
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/40" />
        <div className="shell relative pb-[clamp(3rem,8vh,6rem)]">
          <p data-reveal="fade" className="eyebrow flex flex-wrap items-center gap-4 text-gold">
            <Link to="/projects" className="link-line text-cream/75">
              Projects
            </Link>
            <span aria-hidden className="h-px w-8 bg-gold/60" />
            <span>{project.category}</span>
            {project.sample && <span className="border border-gold/50 px-2 py-1 text-[0.6rem] text-gold-soft">Sample project</span>}
          </p>
          <h1 id="project-title" className="display mt-6 text-display-xxl text-cream">
            <Lines lines={[project.title]} />
          </h1>
        </div>
      </header>

      {/* Meta + intro */}
      <section className="bg-obsidian section-y">
        <div className="shell">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-8 sm:grid-cols-3 lg:grid-cols-5">
            {meta.map((m) => (
              <div key={m.label} data-reveal="fade">
                <dt className="eyebrow text-cream/50">{m.label}</dt>
                <dd className="mt-2 text-cream">{m.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-[clamp(4rem,8vw,7rem)] grid gap-12 lg:grid-cols-12">
            <Words text={project.summary} as="p" className="display text-display-md text-cream lg:col-span-7" />
            <div data-reveal="fade" className="flex flex-col gap-8 text-cream/75 lg:col-span-4 lg:col-start-9">
              <p>{project.intro}</p>
              <ul className="flex flex-wrap gap-2">
                {project.services.map((s) => (
                  <li key={s} className="eyebrow border border-cream/20 px-3 py-1.5 text-[0.62rem] text-cream/70">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section aria-labelledby="concept-title" className="bg-espresso section-y">
        <div className="shell grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div data-reveal="image" className="overflow-hidden">
              <div className="aspect-[4/5] overflow-hidden">
                <div data-parallax="8" className="h-[116%] -translate-y-[8%]">
                  <Img media={project.concept.image} className="size-full object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <SectionLabel index="01" label="Concept" />
            <h2 id="concept-title" className="sr-only">
              Concept
            </h2>
            <blockquote className="display mt-8 text-display-md text-cream">
              <Lines lines={[<>“{project.concept.quote}”</>]} />
            </blockquote>
            <p data-reveal="fade" className="mt-8 text-cream/75">
              {project.concept.body}
            </p>
          </div>
        </div>
      </section>

      {/* Materials */}
      <section aria-labelledby="materials-title" className="bg-obsidian section-y">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="02" label="Material palette" />
            <h2 id="materials-title" className="display mt-8 text-display-lg text-cream">
              <Lines lines={['A short list,', <em key="e">used generously.</em>]} />
            </h2>
          </div>
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {project.materials.map((m) => (
              <li key={m.name} data-reveal="fade" className="flex items-center gap-6 bg-obsidian p-6">
                <span aria-hidden className="size-16 shrink-0 shadow-[inset_0_0_0_1px_rgba(232,223,208,0.12)]" style={{ background: m.swatch }} />
                <div>
                  <p className="font-display text-xl text-cream">{m.name}</p>
                  <p className="mt-1 text-sm text-cream/55">{m.application}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Rooms */}
      <section aria-labelledby="rooms-title" className="bg-obsidian pb-[var(--section-y)]">
        <div className="shell">
          <SectionLabel index="03" label="Room by room" />
          <h2 id="rooms-title" className="sr-only">
            Room by room
          </h2>
          <div className="mt-12 flex flex-col gap-[clamp(4rem,9vw,8rem)]">
            {project.rooms.map((room, i) => (
              <figure key={room.name} className="grid items-end gap-8 lg:grid-cols-12">
                <div className={`lg:col-span-8 ${i % 2 ? 'lg:order-2 lg:col-start-5' : ''}`}>
                  <div data-reveal="image" className="overflow-hidden">
                    <div className="aspect-[3/2] overflow-hidden">
                      <div data-parallax="6" className="h-[112%] -translate-y-[6%]">
                        <Img media={room.image} className="size-full object-cover" sizes="(min-width: 1024px) 66vw, 100vw" />
                      </div>
                    </div>
                  </div>
                </div>
                <figcaption data-reveal="fade" className={`lg:col-span-3 ${i % 2 ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-10'}`}>
                  <p className="eyebrow text-gold">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="display mt-3 text-display-sm text-cream">{room.name}</h3>
                  <p className="mt-4 text-cream/70">{room.note}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications + gallery */}
      <section aria-labelledby="spec-title" className="bg-ink section-y">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel index="04" label="Specifications" />
            <h2 id="spec-title" className="sr-only">
              Specifications
            </h2>
            <dl className="mt-10 border-t border-line">
              {project.specifications.map((s) => (
                <div key={s.label} data-reveal="fade" className="flex justify-between gap-6 border-b border-line py-4">
                  <dt className="text-cream/55">{s.label}</dt>
                  <dd className="text-right text-cream">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {project.gallery.map((g, i) => (
              <div key={g.src} data-reveal="image" className={`overflow-hidden ${i % 2 ? 'sm:mt-20' : ''}`}>
                <div className="aspect-[4/5] overflow-hidden">
                  <Img media={g} className="size-full object-cover" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-obsidian section-y">
        <div className="shell flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display max-w-[16ch] text-display-lg text-cream">
            <Lines lines={['Considering', <>something <em>similar?</em></>]} />
          </h2>
          <ArrowLink to={`/contact?project=${encodeURIComponent(project.title)}`} variant="outline">
            Discuss a project
          </ArrowLink>
        </div>
      </section>

      {/* Prev / next */}
      <nav aria-label="More projects" className="grid border-t border-line bg-obsidian sm:grid-cols-2">
        {[
          { item: prev, label: 'Previous project', Icon: ArrowLeft },
          { item: next, label: 'Next project', Icon: ArrowRight },
        ].map(({ item, label, Icon }, i) => (
          <Link
            key={label}
            to={`/projects/${item.slug}`}
            rel={i ? 'next' : 'prev'}
            className={`group relative flex min-h-[18rem] flex-col justify-end overflow-hidden p-[var(--gutter)] ${i ? 'sm:items-end sm:text-right' : 'border-b border-line sm:border-r sm:border-b-0'}`}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-[var(--ease-luxe)] group-hover:opacity-100 group-focus-visible:opacity-100">
              <Img media={item.cover} className="size-full scale-105 object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-100" sizes="50vw" />
              <div className="absolute inset-0 bg-ink/60" />
            </div>
            <span className="eyebrow relative flex items-center gap-3 text-gold">
              {!i && <Icon className="size-4" strokeWidth={1.25} aria-hidden />}
              {label}
              {!!i && <Icon className="size-4" strokeWidth={1.25} aria-hidden />}
            </span>
            <span className="display relative mt-4 text-display-md text-cream">{item.title}</span>
            <span className="relative mt-2 text-sm text-cream/55">{item.category}</span>
          </Link>
        ))}
      </nav>
    </article>
  )
}
