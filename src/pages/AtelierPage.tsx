import { PageHeader } from '../components/ui/PageHeader'
import { RoomConfigurator } from '../components/atelier/RoomConfigurator'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AtelierPage() {
  usePageMeta('Atelier', 'Compose a living room in real time — choose stone, timber, upholstery, metalwork and light in an interactive 3D scene.')
  return (
    <>
      <PageHeader
        index="01"
        label="The Atelier"
        title={['Compose', <>a room <em>in real time.</em></>]}
        intro="A living room rendered live in your browser. Every choice below changes the real materials and lighting in the scene."
        aside={
          <p className="text-sm text-cream/55">
            Finishes are representative studies, not product specifications. Final selections are always made from physical samples.
          </p>
        }
      />
      <section aria-label="Room configurator" className="bg-obsidian pb-[var(--section-y)]">
        <RoomConfigurator />
      </section>
    </>
  )
}
