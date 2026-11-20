import { useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { projectCategories, projects } from '../../data/projects'
import { EASE_LUXE } from '../../lib/motion'
import { useFinePointer } from '../../hooks/useMediaQuery'
import type { ProjectCategory } from '../../types/content'
import { Img } from '../ui/Img'

type Filter = 'All' | ProjectCategory

/** Typographic index of every project with category filters and a cursor-following preview on fine pointers. */
export function ProjectIndex() {
  const [filter, setFilter] = useState<Filter>('All')
  const [hovered, setHovered] = useState<string | null>(null)
  const finePointer = useFinePointer()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 140, damping: 20, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 140, damping: 20, mass: 0.6 })

  const visible = projects.filter((p) => filter === 'All' || p.category === filter)
  const hoveredProject = projects.find((p) => p.slug === hovered)
  const filters: Filter[] = ['All', ...projectCategories]

  const onMove = (e: PointerEvent) => {
    x.set(e.clientX)
    y.set(e.clientY)
  }

  return (
    <div className="relative">
      <div role="group" aria-label="Filter projects by category" className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2">
        {filters.map((f) => {
          const count = f === 'All' ? projects.length : projects.filter((p) => p.category === f).length
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={`eyebrow min-h-11 shrink-0 border px-4 transition-colors duration-500 ${
                active ? 'border-gold bg-gold text-obsidian' : 'border-line text-cream/70 hover:border-gold/60 hover:text-cream'
              }`}
            >
              {f} <span className="ml-1 opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
      </p>

      <motion.ul layout className="mt-10 border-t border-line" onPointerMove={finePointer ? onMove : undefined} onPointerLeave={() => setHovered(null)}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((project) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7, ease: EASE_LUXE }}
              className="border-b border-line"
            >
              <Link
                to={`/projects/${project.slug}`}
                onPointerEnter={() => setHovered(project.slug)}
                onFocus={() => setHovered(project.slug)}
                onBlur={() => setHovered(null)}
                className="group grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[3rem_1fr_auto] sm:py-7 lg:grid-cols-[4rem_minmax(0,1.6fr)_1fr_0.8fr_4rem_2rem]"
              >
                <span className="eyebrow hidden text-gold tabular-nums sm:block">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
                <span className="block aspect-[4/3] overflow-hidden sm:hidden">
                  <Img media={project.cover} alt="" className="size-full object-cover" sizes="6rem" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="display text-[clamp(1.6rem,1.1rem+2vw,3.25rem)] leading-tight text-cream transition-[color,transform] duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-2 group-hover:text-brass-soft">
                    {project.title}
                  </span>
                  <span className="eyebrow text-cream/55 lg:hidden">
                    {project.category} · {project.year}
                  </span>
                </span>
                <span className="hidden text-sm text-cream/70 lg:block">{project.category}</span>
                <span className="hidden text-sm text-cream/55 lg:block">{project.location}</span>
                <span className="hidden text-sm text-cream/55 tabular-nums lg:block">{project.year}</span>
                <ArrowUpRight aria-hidden className="size-5 justify-self-end text-gold transition-transform duration-700 group-hover:-translate-y-1 group-hover:translate-x-1" strokeWidth={1.25} />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {finePointer && (
        <motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-40 hidden lg:block" style={{ x: sx, y: sy }}>
          <AnimatePresence>
            {hoveredProject && (
              <motion.div
                key={hoveredProject.slug}
                initial={{ opacity: 0, scale: 0.85, clipPath: 'inset(20% 20% 20% 20%)' }}
                animate={{ opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: EASE_LUXE }}
                className="absolute -top-36 left-8 h-56 w-80 overflow-hidden bg-espresso shadow-2xl shadow-black/50"
              >
                <Img media={hoveredProject.cover} alt="" className="size-full object-cover" sizes="20rem" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
