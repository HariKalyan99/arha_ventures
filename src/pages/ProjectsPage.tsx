import { PageHeader } from '../components/ui/PageHeader'
import { ProjectIndex } from '../components/portfolio/ProjectIndex'
import { projects } from '../data/projects'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProjectsPage() {
  usePageMeta('Projects', 'Residences, villas, penthouses, hospitality and workplace interiors by ARHA.')
  return (
    <>
      <PageHeader
        index="01"
        label="Projects"
        title={['Spaces with', <><em>a point</em> of view.</>]}
        intro="Residences, villas, hospitality and workplaces — each composed around a single idea and carried through to the smallest detail."
        aside={
          <p className="eyebrow text-cream/50">
            {projects.length} projects · {projects.some((p) => p.sample) ? 'Sample portfolio' : 'Selected work'}
          </p>
        }
      />
      <section aria-label="Project index" className="bg-obsidian pb-[var(--section-y)]">
        <div className="shell">
          <ProjectIndex />
        </div>
      </section>
    </>
  )
}
