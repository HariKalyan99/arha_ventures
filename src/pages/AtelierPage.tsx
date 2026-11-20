import { PageHeader } from '../components/ui/PageHeader'
import { RoomConfigurator } from '../components/atelier/RoomConfigurator'
import { usePageMeta } from '../hooks/usePageMeta'

/** Educational finish study — learn how materials combine in a live room. */
export default function AtelierPage() {
  usePageMeta(
    'Atelier',
    'An educational 3D material study — learn which floors, walls, textiles and metals work together, and why.',
  )
  return (
    <>
      <PageHeader
        index="01"
        label="The Atelier"
        title={['Learn', <>how a room <em>holds together.</em></>]}
        intro="A living room rendered live in your browser. Change a finish, then see what pairs with it — and why some combinations feel resolved while others compete."
        aside={
          <p className="text-sm text-cream/55">
            This is a study tool, not a product catalogue. Finishes are digital approximations; physical samples always decide the final selection.
          </p>
        }
      />
      <section aria-label="Material study configurator" className="bg-obsidian pb-[var(--section-y)]">
        <RoomConfigurator />
      </section>
    </>
  )
}
