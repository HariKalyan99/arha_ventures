import { useRef, type ReactNode } from 'react'
import { useReveal } from '../../animations/reveal'
import type { MediaAsset } from '../../types/content'
import { Img } from './Img'
import { SectionLabel } from './SectionLabel'
import { Lines } from './Text'

interface PageHeaderProps {
  index: string
  label: string
  title: ReactNode[]
  intro?: ReactNode
  aside?: ReactNode
  image?: MediaAsset
}

/** Editorial opening for interior pages: oversized title, intro column and an optional full-bleed image. */
export function PageHeader({ index, label, title, intro, aside, image }: PageHeaderProps) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <header ref={ref} className="relative bg-obsidian pt-[calc(var(--header-h)+clamp(4rem,10vw,9rem))]">
      <div className="shell">
        <SectionLabel index={index} label={label} />
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1 className="display text-display-xl text-cream lg:col-span-8">
            <Lines lines={title} />
          </h1>
          {(intro || aside) && (
            <div data-reveal="fade" className="flex flex-col gap-6 text-cream/75 lg:col-span-4 lg:pb-3">
              {intro && <div className="text-lead">{intro}</div>}
              {aside}
            </div>
          )}
        </div>
        <div data-reveal="rule" aria-hidden className="hairline mt-[clamp(3rem,6vw,5rem)]" />
      </div>
      {image && (
        <div className="mt-[clamp(3rem,6vw,5rem)] px-[var(--gutter)]">
          <div data-reveal="image" className="overflow-hidden">
            <div className="aspect-[4/5] overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
              <div data-parallax="7" className="h-[114%] -translate-y-[7%]">
                <Img media={image} priority className="size-full object-cover" sizes="100vw" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
