import { PageHeader } from '../components/ui/PageHeader'
import { Services } from '../components/sections/Services'
import { Process } from '../components/sections/Process'
import { ArrowLink } from '../components/ui/ArrowButton'
import { media } from '../data/media'
import { company } from '../data/site'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ServicesPage() {
  usePageMeta('Services', company.paragraphs[1])
  return (
    <>
      <PageHeader
        index="01"
        label="Services"
        title={['Planning, construction', <>& <em>interiors.</em></>]}
        intro={company.paragraphs[1]}
        aside={
          <div>
            <ArrowLink to="/contact" variant="outline">
              Discuss a project
            </ArrowLink>
          </div>
        }
        image={media['drawing']}
      />
      <Services index="02" heading={['Disciplines', <em key="e">we practise.</em>]} />
      <Process index="03" />
    </>
  )
}
