import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { floorOptions, metalOptions, upholsteryOptions, wallOptions } from '../../data/configurator'
import { useReveal } from '../../animations/reveal'
import { SectionLabel } from '../ui/SectionLabel'
import { ArrowLink } from '../ui/ArrowButton'
import { Lines } from '../ui/Text'

/** Curated board — one from each family, skewed toward newer finishes so the teaser matches the study. */
const samples = [
  floorOptions.find((o) => o.id === 'limestone')!,
  wallOptions.find((o) => o.id === 'oak-slats')!,
  upholsteryOptions.find((o) => o.id === 'ink')!,
  metalOptions.find((o) => o.id === 'copper')!,
  floorOptions.find((o) => o.id === 'nero')!,
]

/** Home-page invitation into the configurator: a fanned sample board rendered with CSS 3D transforms. */
export function AtelierTeaser({ index }: { index: string }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  return (
    <section ref={ref} aria-labelledby="atelier-title" className="relative overflow-hidden surface-espresso section-y">
      <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionLabel index={index} label="The Atelier" />
          <h2 id="atelier-title" className="display mt-6 text-display-xl text-cream">
            <Lines lines={['Learn', <>how materials <em>belong together.</em></>]} />
          </h2>
          <p data-reveal="fade" className="mt-5 max-w-md text-cream/60">
            Step inside a living room rendered live in your browser. Change a finish, see what pairs with it, and watch the same space move from daylight to
            firelight — a quiet education in how rooms hold together.
          </p>
          <div data-reveal="fade" className="mt-8">
            <ArrowLink to="/atelier" variant="outline">
              Enter the study
            </ArrowLink>
          </div>
        </div>

        <Link
          to="/atelier"
          aria-label="Open the interactive 3D atelier"
          className="group relative block h-[clamp(20rem,46vw,34rem)] [perspective:1400px] lg:col-span-6 lg:col-start-7"
          data-reveal="fade"
        >
          {/* Soft contact shadow under the fan */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[18%] bottom-[10%] h-[26%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_72%)] blur-2xl transition-opacity duration-[1400ms] ease-[var(--ease-luxe)] group-hover:opacity-70"
          />

          <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d] [transform:rotateX(52deg)_rotateZ(-24deg)] motion-safe:transition-transform motion-safe:duration-[1400ms] motion-safe:ease-[var(--ease-luxe)] motion-safe:group-hover:[transform:rotateX(46deg)_rotateZ(-18deg)]">
            {samples.map((s, i) => (
              <div
                key={`${s.id}-${i}`}
                className="absolute aspect-[3/4] w-[clamp(8rem,20vw,14rem)] border border-black/20 [transform:var(--rest)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-[1400ms] motion-safe:ease-[var(--ease-luxe)] motion-safe:group-hover:[transform:var(--fan)] motion-safe:group-focus-visible:[transform:var(--fan)] shadow-[0_2px_4px_rgba(0,0,0,0.25),0_12px_24px_-8px_rgba(0,0,0,0.55),0_36px_64px_-20px_rgba(0,0,0,0.7)] group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.3),0_18px_36px_-10px_rgba(0,0,0,0.6),0_48px_80px_-24px_rgba(0,0,0,0.75)]"
                style={
                  {
                    background: s.swatch,
                    '--rest': `translate3d(${(i - 2) * 18}%, ${(i - 2) * -6}%, ${i * 26}px) rotateZ(${(i - 2) * 4}deg)`,
                    '--fan': `translate3d(${(i - 2) * 46}%, ${(i - 2) * -10}%, ${i * 40}px) rotateZ(${(i - 2) * 9}deg)`,
                  } as CSSProperties
                }
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_32%,transparent_70%,rgba(0,0,0,0.18)_100%)]"
                />
                <span className="eyebrow absolute bottom-3 left-3 bg-obsidian/80 px-2 py-1 text-[0.58rem] text-cream shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <span className="eyebrow absolute right-0 bottom-0 text-cream/40 transition-colors duration-500 group-hover:text-gold">Live 3D · WebGL</span>
        </Link>
      </div>
    </section>
  )
}
