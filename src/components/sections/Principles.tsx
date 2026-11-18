import { useRef } from 'react'
import { useReveal } from '../../animations/reveal'
import { SectionLabel } from '../ui/SectionLabel'
import { Lines } from '../ui/Text'

const principles = [
  {
    numeral: 'I',
    title: 'Material honesty',
    body: 'Stone that looks like stone, timber that ages like timber. We specify fewer materials and let each one carry its full weight.',
  },
  {
    numeral: 'II',
    title: 'Light as structure',
    body: 'Daylight is the first material we design with. Artificial light follows it — concealed, layered and tuned to the hour.',
  },
  {
    numeral: 'III',
    title: 'Crafted restraint',
    body: 'Every junction is drawn, every edge considered. Restraint is not absence; it is the confidence to stop at enough.',
  },
]

export function Principles() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} aria-labelledby="principles-title" className="bg-obsidian section-y">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionLabel index="02" label="Principles" />
          <h2 id="principles-title" className="display mt-8 text-display-lg text-cream">
            <Lines lines={['Three ideas', <em key="e">we return to.</em>]} />
          </h2>
        </div>
        <ol className="flex flex-col lg:col-span-7 lg:col-start-6">
          {principles.map((p, i) => (
            <li key={p.title} data-reveal="fade" data-delay={i * 0.1} className="relative grid gap-4 py-10 sm:grid-cols-[6rem_1fr]">
              <span data-reveal="rule" aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
              <p className="font-display text-4xl text-gold italic">{p.numeral}.</p>
              <div>
                <h3 className="display text-display-sm text-cream">{p.title}</h3>
                <p className="mt-4 max-w-lg text-cream/70">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
