import { useRef, type FocusEvent } from 'react'
import { Link } from 'react-router'
import { featuredProjects, projects } from '../../data/projects'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { useSmoothScroll } from '../../lib/scroll-context'
import { useReveal } from '../../animations/reveal'
import type { Project } from '../../types/content'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'
import { ArrowLink } from '../ui/ArrowButton'

const DESKTOP_MOTION = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

export function ProjectsShowcase() {
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const horizontal = useRef<ScrollTrigger | null>(null)
  const { scrollTo } = useSmoothScroll()
  useReveal(section)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(DESKTOP_MOTION, () => {
        const el = track.current!
        const distance = () => el.scrollWidth - window.innerWidth
        const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', el)

        // Vertical scroll drives the horizontal track while the viewport is pinned.
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin.current,
            pin: true,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
              if (counter.current) {
                const index = Math.min(featuredProjects.length, Math.max(1, Math.round(self.progress * (featuredProjects.length - 1)) + 1))
                counter.current.textContent = String(index).padStart(2, '0')
              }
            },
          },
        })
        horizontal.current = tween.scrollTrigger ?? null

        // Images drift inside their frames as panels travel across the viewport.
        panels.forEach((panel) => {
          panel.querySelectorAll<HTMLElement>('[data-hparallax]').forEach((layer) => {
            gsap.fromTo(
              layer,
              { xPercent: -7 },
              {
                xPercent: 7,
                ease: 'none',
                scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
              },
            )
          })
        })

        return () => {
          horizontal.current = null
        }
      })
    },
    { scope: section },
  )

  /** Keeps keyboard focus visible: tabbing to an off-screen card scrolls the pinned track to it. */
  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    const st = horizontal.current
    const panel = (e.target as HTMLElement).closest<HTMLElement>('[data-panel]')
    if (!st || !panel || !track.current) return
    const max = track.current.scrollWidth - window.innerWidth
    const left = Math.min(max, Math.max(0, panel.offsetLeft - window.innerWidth * 0.2))
    scrollTo(st.start + (left / max) * (st.end - st.start), { immediate: true })
  }

  return (
    <section ref={section} id="projects" aria-labelledby="projects-title" className="relative z-10 surface-ink">
      <div className="shell section-y pb-[clamp(3rem,6vw,6rem)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionLabel index="02" label="Selected Work" />
            <h2 id="projects-title" className="display mt-8 text-display-xl text-cream">
              <Lines lines={['Spaces with', <><em>a point</em> of view.</>]} />
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-4 lg:col-start-9">
            <p data-reveal="fade" className="text-cream/60">
              Residences, villas, hospitality and workplaces — each one conceived around a single idea and carried through to the smallest
              detail. The projects shown are sample content for this site.
            </p>
            <ArrowLink variant="ghost" className="self-start" to="/projects">
              Full index · {projects.length} projects
            </ArrowLink>
          </div>
        </div>
      </div>

      <div ref={pin} className="relative lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden">
        <div
          ref={track}
          onFocus={handleFocus}
          className="flex flex-col gap-[clamp(4rem,10vw,7rem)] px-[var(--gutter)] lg:w-max lg:flex-row lg:items-center lg:gap-[7vw] lg:motion-reduce:w-auto lg:motion-reduce:overflow-x-auto lg:motion-reduce:pb-8"
        >
          {featuredProjects.map((project, i) => (
            <ShowcasePanel key={project.slug} project={project} index={i} />
          ))}
          <div data-panel className="flex flex-col justify-start gap-6 max-lg:pb-[clamp(2.75rem,7vw,4.5rem)] lg:w-[34vw] lg:justify-center lg:pr-[8vw]">
            <p className="eyebrow text-gold">Index</p>
            <p className="display text-display-md text-cream">
              {projects.length} projects, <em>one sensibility.</em>
            </p>
            <ArrowLink variant="outline" className="self-start" to="/projects">
              Browse every project
            </ArrowLink>
          </div>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-8 hidden px-[var(--gutter)] lg:block lg:motion-reduce:hidden">
          <div className="flex items-center gap-6">
            <span className="eyebrow text-cream/45">
              <span ref={counter} className="text-cream">
                01
              </span>{' '}
              / {String(featuredProjects.length).padStart(2, '0')}
            </span>
            <span className="relative h-px flex-1 bg-line">
              <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
            </span>
            <span className="eyebrow text-cream/45">Scroll to travel</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Three alternating compositions keep the sequence from reading as a grid of identical cards. */
function ShowcasePanel({ project, index }: { project: Project; index: number }) {
  const variant = index % 3
  const number = String(index + 1).padStart(2, '0')

  const meta = (
    <div className="flex flex-col gap-3">
      <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-cream/45">
        <span className="text-gold">{number}</span>
        <span>{project.category}</span>
        <span aria-hidden>·</span>
        <span>{project.year}</span>
        {project.sample && <span className="border border-gold/40 px-1.5 py-0.5 text-[0.6rem] text-gold">Sample</span>}
      </p>
      <h3 className="display text-display-md text-cream transition-colors duration-700 group-hover:text-brass-soft">{project.title}</h3>
      <p className="max-w-sm text-sm text-cream/55">{project.summary}</p>
    </div>
  )

  const frame = (asset: Project['cover'], aspect: string, sizes: string, extra = '') => (
    <div className={`media-grade overflow-hidden bg-espresso ${aspect} ${extra}`}>
      <div className="size-full transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-[1.04]">
        <div data-hparallax className="size-full scale-[1.16]">
          <Img media={asset} className="size-full object-cover" sizes={sizes} />
        </div>
      </div>
    </div>
  )

  if (variant === 1) {
    return (
      <article data-panel className="lg:shrink-0">
        <Link to={`/projects/${project.slug}`} className="group flex flex-col gap-6 lg:w-[min(60vw,58vh*1.6)]">
          {frame(project.cover, 'aspect-[16/10] w-full', '(min-width: 1024px) 64vw, 100vw')}
          <div className="lg:-mt-24 lg:ml-[8%] lg:max-w-md lg:bg-ink/90 lg:p-8 lg:backdrop-blur-sm">{meta}</div>
        </Link>
      </article>
    )
  }

  if (variant === 2) {
    return (
      <article data-panel className="lg:shrink-0">
        <Link to={`/projects/${project.slug}`} className="group grid grid-cols-5 items-end gap-5 lg:flex lg:gap-8">
          {frame(project.cover, 'col-span-3 aspect-[3/4] lg:h-[62vh]', '(min-width: 1024px) 30vw, 60vw')}
          <div className="col-span-2 flex flex-col gap-8 lg:w-[22vw]">
            {frame(project.detail, 'aspect-square w-full', '(min-width: 1024px) 22vw, 40vw')}
            <div className="hidden lg:block">{meta}</div>
          </div>
          <div className="col-span-5 lg:hidden">{meta}</div>
        </Link>
      </article>
    )
  }

  return (
    <article data-panel className={`lg:shrink-0 ${index % 2 ? 'ml-auto w-[88%] lg:ml-0 lg:w-auto' : ''}`}>
      <Link to={`/projects/${project.slug}`} className="group flex flex-col gap-6 lg:w-[min(34vw,56vh*0.8)]">
        {frame(project.cover, 'aspect-[4/5] w-full', '(min-width: 1024px) 36vw, 90vw')}
        {meta}
      </Link>
    </article>
  )
}
