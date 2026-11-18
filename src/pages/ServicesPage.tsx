import { PageHeader } from '../components/ui/PageHeader'
import { Services } from '../components/sections/Services'
import { Process } from '../components/sections/Process'
import { ArrowLink } from '../components/ui/ArrowButton'
import { media } from '../data/media'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ServicesPage() {
  usePageMeta('Services', 'Architecture, interior architecture, interior design, furniture, lighting and project delivery.')
  return (
    <>
      <PageHeader
        index="01"
        label="Services"
        title={['One studio,', <>from <em>plan</em> to object.</>]}
        intro="We can take a project from site analysis to the last cushion, or join for a single discipline. Either way, the same team stays with you throughout."
        aside={
          <div>
            <ArrowLink to="/contact" variant="outline">
              Discuss a project
            </ArrowLink>
          </div>
        }
        image={media['plans']}
      />
      <Services index="02" heading={['Disciplines', <em key="e">we practise.</em>]} />
      <Process index="03" />
    </>
  )
}
