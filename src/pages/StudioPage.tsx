import { PageHeader } from '../components/ui/PageHeader'
import { Principles } from '../components/sections/Principles'
import { Materials } from '../components/sections/Materials'
import { Testimonials } from '../components/sections/Testimonials'
import { media } from '../data/media'
import { usePageMeta } from '../hooks/usePageMeta'

export default function StudioPage() {
  usePageMeta('Studio', 'An architecture and interior design studio working in stone, timber and light.')
  return (
    <>
      <PageHeader
        index="01"
        label="The Studio"
        title={['A small studio', <>for <em>considered</em> rooms.</>]}
        intro="We are architects and interior designers who believe a home should feel inevitable — as if it could not have been any other way."
        aside={
          <p>
            Every project is led personally from first sketch to final styling. We take on a limited number of commissions each year so that each one receives
            the same patience and precision.
          </p>
        }
        image={media['living-wood-stone']}
      />
      <Principles />
      <Materials index="03" />
      <Testimonials index="04" />
    </>
  )
}
