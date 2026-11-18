import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { gsap, MOTION_QUERY, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { getQualityTier, hasWebGL } from '../../lib/device'
import { useInViewport } from '../../hooks/useInViewport'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useSmoothScroll } from '../../lib/scroll-context'
import { media } from '../../data/media'
import { studio } from '../../data/site'
import { Img } from '../ui/Img'
import { ArrowButton, ArrowLink } from '../ui/ArrowButton'
import { SceneErrorBoundary } from '../three/SceneErrorBoundary'

const HeroScene = lazy(() => import('../three/HeroScene'))

function StaticHeroImage() {
  return (
    <div className="absolute inset-0">
      <Img media={media['living-stone']} priority className="size-full object-cover" sizes="100vw" />
    </div>
  )
}

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [ready, setReady] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const visible = useInViewport(section, '0px')
  const webgl = useMemo(() => hasWebGL(), [])
  const tier = useMemo(() => getQualityTier(), [])
  const { scrollTo } = useSmoothScroll()

  useGSAP(
    () => {
      // Scroll progress drives the 3D camera dolly and the dusk → night lighting blend.
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress.current = self.progress
        },
      })

      const mm = gsap.matchMedia()
      mm.add(MOTION_QUERY, () => {
        const intro = gsap.timeline({ delay: 0.35 })
        intro
          .from('[data-hero-line]', { yPercent: 110, duration: 1.8, stagger: 0.12 })
          .from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.4, stagger: 0.1 }, '-=1.2')
          .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1.6 }, '<')

        gsap
          .timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: true } })
          .to('[data-hero-copy]', { yPercent: -18, autoAlpha: 0, ease: 'none', duration: 0.45 }, 0)
          .to('[data-hero-cue]', { autoAlpha: 0, ease: 'none', duration: 0.15 }, 0)
          .fromTo('[data-hero-night]', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'none', duration: 0.3 }, 0.45)
          .to('[data-hero-night]', { autoAlpha: 0, ease: 'none', duration: 0.15 }, 0.85)
      })
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      id="top"
      aria-labelledby="hero-title"
      className="relative h-[180svh] bg-ink motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Scene layer */}
        <div className="absolute inset-0" aria-hidden>
          {webgl ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_40%,#3a2c22_0%,#171716_60%,#10100f_100%)]" />
              <SceneErrorBoundary fallback={<StaticHeroImage />}>
                <Suspense fallback={null}>
                  <div className={`absolute inset-0 transition-opacity duration-[2400ms] ease-[var(--ease-luxe)] ${ready ? 'opacity-100' : 'opacity-0'}`}>
                    <HeroScene progress={progress} active={visible} reducedMotion={reducedMotion} tier={tier} onReady={() => setReady(true)} />
                  </div>
                </Suspense>
              </SceneErrorBoundary>
            </>
          ) : (
            <StaticHeroImage />
          )}
        </div>

        {/* Legibility veils */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,16,15,0.82)_0%,rgba(16,16,15,0.45)_38%,rgba(16,16,15,0)_68%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />

        {/* Copy */}
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end pb-[clamp(7rem,15vh,10.5rem)]">
          <div className="shell" data-hero-copy>
            <p data-hero-fade className="eyebrow mb-6 flex items-center gap-4 text-gold">
              <span>{studio.name}</span>
              <span aria-hidden className="h-px w-10 bg-gold/60" />
              <span className="text-cream/75">{studio.tagline}</span>
            </p>
            <h1 id="hero-title" className="display max-w-[14ch] text-display-xl text-cream">
              <span className="block overflow-hidden pb-[0.08em]">
                <span data-hero-line className="block">Rooms composed</span>
              </span>{' '}
              <span className="block overflow-hidden pb-[0.08em]">
                <span data-hero-line className="block">
                  in <em>stone, timber</em>
                </span>
              </span>{' '}
              <span className="block overflow-hidden pb-[0.08em]">
                <span data-hero-line className="block">& quiet light.</span>
              </span>
            </h1>
            <div data-hero-rule className="hairline mt-8 max-w-xl bg-gold/40" />
            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p data-hero-fade className="max-w-md text-lead text-cream/80">
                An architecture and interior design studio shaping residences, villas and hospitality spaces with patience,
                precision and a reverence for material.
              </p>
              <div data-hero-fade className="pointer-events-auto flex flex-wrap gap-3">
                <ArrowButton variant="solid" onClick={() => scrollTo('projects')}>
                  View the work
                </ArrowButton>
                <ArrowLink variant="outline" to="/atelier">
                  Compose a room
                </ArrowLink>
              </div>
            </div>
          </div>
        </div>

        {/* Second beat of the hero, revealed as the scene turns to night */}
        <div
          data-hero-night
          className="pointer-events-none invisible absolute inset-x-0 bottom-[clamp(5rem,14vh,10rem)] z-10 opacity-0 motion-reduce:hidden"
        >
          <div aria-hidden className="absolute -inset-y-24 right-0 w-full bg-[radial-gradient(60%_70%_at_85%_60%,rgba(16,16,15,0.7),transparent)] md:w-2/3" />
          <div className="shell relative flex justify-end">
            <p className="display max-w-[18ch] text-right text-display-md text-cream">
              As evening falls, <em>the room</em> changes its voice.
            </p>
          </div>
        </div>

        {/* Scene caption + scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="shell relative flex items-end justify-between pb-6">
            <p data-hero-fade className="eyebrow hidden text-cream/60 md:block">
              {webgl ? 'Live 3D render · A living room at dusk' : 'A living room in stone and timber'}
            </p>
            <div data-hero-cue className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-cream/70">
              <span className="eyebrow">Scroll</span>
              <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-cream/15">
                <span className="animate-scroll-cue absolute inset-0 bg-gold" />
              </span>
            </div>
            <p data-hero-fade className="eyebrow hidden text-cream/60 md:block">
              N° 01 — Residence study
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
