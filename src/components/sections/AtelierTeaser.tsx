import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { floorOptions, metalOptions, upholsteryOptions, wallOptions } from '../../data/configurator'
import { useReveal } from '../../animations/reveal'
import { SectionLabel } from '../ui/SectionLabel'
import { ArrowLink } from '../ui/ArrowButton'
import { Lines } from '../ui/Text'

const samples = [floorOptions[0], wallOptions[0], upholsteryOptions[1], metalOptions[0], floorOptions[1]]

/** Home-page invitation into the configurator: a fanned sample board rendered with CSS 3D transforms. */
export function AtelierTeaser({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} aria-labelledby="atelier-title" className="relative overflow-hidden bg-espresso section-y">
      <div className="shell grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionLabel index={index} label="The Atelier" />
          <h2 id="atelier-title" className="display mt-8 text-display-xl text-cream">
            <Lines lines={['Compose', <>a room <em>in real time.</em></>]} />
          </h2>
          <p data-reveal="fade" className="mt-8 max-w-md text-cream/75">
            Step inside a living room rendered live in your browser. Change the stone underfoot, the panelling, the upholstery and the metalwork — then watch
            the same space move from daylight to firelight.
          </p>
          <div data-reveal="fade" className="mt-10">
            <ArrowLink to="/atelier" variant="outline">
              Enter the atelier
            </ArrowLink>
          </div>
        </div>

        <Link
          to="/atelier"
          aria-label="Open the interactive 3D atelier"
          className="group relative block h-[clamp(20rem,46vw,34rem)] [perspective:1400px] lg:col-span-6 lg:col-start-7"
          data-reveal="fade"
        >
          <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] [transform:rotateX(52deg)_rotateZ(-24deg)] motion-safe:transition-transform motion-safe:duration-[1400ms] motion-safe:ease-[var(--ease-luxe)] motion-safe:group-hover:[transform:rotateX(46deg)_rotateZ(-18deg)]">
            {samples.map((s, i) => (
              <div
                key={`${s.id}-${i}`}
                className="absolute aspect-[3/4] w-[clamp(8rem,20vw,14rem)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] [transform:var(--rest)] motion-safe:transition-transform motion-safe:duration-[1400ms] motion-safe:ease-[var(--ease-luxe)] motion-safe:group-hover:[transform:var(--fan)] motion-safe:group-focus-visible:[transform:var(--fan)]"
                style={
                  {
                    background: s.swatch,
                    '--rest': `translate3d(${(i - 2) * 18}%, ${(i - 2) * -6}%, ${i * 26}px) rotateZ(${(i - 2) * 4}deg)`,
                    '--fan': `translate3d(${(i - 2) * 46}%, ${(i - 2) * -10}%, ${i * 40}px) rotateZ(${(i - 2) * 9}deg)`,
                  } as CSSProperties
                }
              >
                <span className="eyebrow absolute bottom-3 left-3 bg-obsidian/75 px-2 py-1 text-[0.58rem] text-cream">{s.label}</span>
              </div>
            ))}
          </div>
          <span className="eyebrow absolute right-0 bottom-0 text-cream/50 transition-colors duration-500 group-hover:text-gold">Live 3D · WebGL</span>
        </Link>
      </div>
    </section>
  )
}
