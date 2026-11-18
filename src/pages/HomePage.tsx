import { Hero } from '../components/hero/Hero'
import { Philosophy } from '../components/sections/Philosophy'
import { ProjectsShowcase } from '../components/portfolio/ProjectsShowcase'
import { Services } from '../components/sections/Services'
import { AtelierTeaser } from '../components/sections/AtelierTeaser'
import { Testimonials } from '../components/sections/Testimonials'
import { ArrowLink } from '../components/ui/ArrowButton'
import { usePageMeta } from '../hooks/usePageMeta'

export default function HomePage() {
  usePageMeta(null)
  return (
    <>
      <Hero />
      <Philosophy />
      <ProjectsShowcase />
      <Services
        index="03"
        intro="Architecture, interiors and everything between — delivered by one studio, so the building and the rooms within it are conceived as a single thought."
        footer={
          <ArrowLink to="/services" variant="ghost">
            Services & process
          </ArrowLink>
        }
      />
      <AtelierTeaser index="04" />
      <Testimonials index="05" />
    </>
  )
}
