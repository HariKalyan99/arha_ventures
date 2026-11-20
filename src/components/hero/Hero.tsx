import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap, MOTION_QUERY, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { getQualityTier, hasWebGL } from '../../lib/device'
import { useInViewport } from '../../hooks/useInViewport'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useSmoothScroll } from '../../lib/scroll-context'
import { EASE_LUXE } from '../../lib/motion'
import { media } from '../../data/media'
import { studio } from '../../data/site'
import { houseTourStops, isTourHold, mapTourScrollProgress, tourHoldReveal, tourStopAt } from '../three/tourStops'
import { ROOM_SOURCE } from '../three/roomSource'
import { Img } from '../ui/Img'
import { ArrowButton, ArrowLink } from '../ui/ArrowButton'
import { SceneErrorBoundary } from '../three/SceneErrorBoundary'

const HeroScene = lazy(() => import('../three/HeroScene'))
const isTour = ROOM_SOURCE === 'glb'

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
  const [stopIndex, setStopIndex] = useState(0)
  const [touring, setTouring] = useState(false)
  const [holding, setHolding] = useState(false)
  const [holdReveal, setHoldReveal] = useState(0)
  const reducedMotion = usePrefersReducedMotion()
  const visible = useInViewport(section, '0px')
  const webgl = useMemo(() => hasWebGL(), [])
  const tier = useMemo(() => getQualityTier(), [])
  const { scrollTo } = useSmoothScroll()
  const stop = houseTourStops[stopIndex]
  const isConclusion = isTour && stopIndex === houseTourStops.length - 1

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.current = self.progress
          if (!isTour) return
          const mapped = mapTourScrollProgress(self.progress)
          const { displayIndex } = tourStopAt(mapped)
          /* Only commit React state when values change — avoids scroll-frame re-renders. */
          setStopIndex((prev) => (prev === displayIndex ? prev : displayIndex))
          const nextTouring = self.progress > 0.05
          setTouring((prev) => (prev === nextTouring ? prev : nextTouring))
          const nextHolding = isTourHold(self.progress)
          setHolding((prev) => (prev === nextHolding ? prev : nextHolding))
          const nextReveal = Math.round(tourHoldReveal(self.progress) * 50) / 50
          setHoldReveal((prev) => (prev === nextReveal ? prev : nextReveal))
        },
      })

      const mm = gsap.matchMedia()
      mm.add(MOTION_QUERY, () => {
        const intro = gsap.timeline({ delay: 0.35 })
        intro
          .from('[data-hero-line]', { yPercent: 110, duration: 1.8, stagger: 0.12 })
          .from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.4, stagger: 0.1 }, '-=1.2')
          .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left', duration: 1.6 }, '<')

        const scrub = gsap.timeline({
          scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: true },
        })
        scrub
          .to('[data-hero-copy]', { yPercent: -10, autoAlpha: 0, ease: 'none', duration: 0.14 }, 0)
          .to('[data-hero-cue]', { autoAlpha: 0, ease: 'none', duration: 0.08 }, 0)

        if (isTour) {
          // Tour copy stays fully readable through the final hold, then eases out as the page continues.
          scrub
            .fromTo('[data-hero-tour]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, ease: 'none', duration: 0.12 }, 0.08)
            .to('[data-hero-tour]', { autoAlpha: 1, ease: 'none', duration: 0.55 }, 0.2)
            .to('[data-hero-tour]', { autoAlpha: 0, y: -12, ease: 'none', duration: 0.12 }, 0.92)
        } else {
          scrub
            .fromTo('[data-hero-night]', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'none', duration: 0.3 }, 0.45)
            .to('[data-hero-night]', { autoAlpha: 0, ease: 'none', duration: 0.15 }, 0.85)
        }
      })
    },
    { scope: section },
  )

  return (
    <section
      ref={section}
      id="top"
      aria-labelledby="hero-title"
      className={`relative bg-[#111111] motion-reduce:h-svh ${isTour ? 'h-[780svh]' : 'h-[180svh]'}`}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          {webgl ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_40%,#2d2420_0%,#171717_60%,#111111_100%)]" />
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

        {/* Cinematic veils — stronger left plate on phones so copy clears the bright teapoy */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,16,15,0.72)_0%,rgba(16,16,15,0.42)_28%,rgba(16,16,15,0.12)_48%,rgba(16,16,15,0)_62%)] md:bg-[linear-gradient(90deg,rgba(16,16,15,0.48)_0%,rgba(16,16,15,0.22)_22%,rgba(16,16,15,0.06)_40%,rgba(16,16,15,0)_56%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-[#111111]/75 via-[#111111]/28 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#111111]/45 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_65%_at_70%_45%,transparent_42%,rgba(16,16,15,0.1)_100%)]" />

        {/* Opening copy — optically centered between header and bottom chrome */}
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-center pt-[var(--header-h)] pb-[clamp(3.5rem,8vh,7.5rem)]">
          <div className="shell" data-hero-copy>
            <p data-hero-fade className="eyebrow mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-gold sm:mb-5">
              <span>{studio.name}</span>
              <span aria-hidden className="hidden h-px w-10 bg-gold/60 sm:block" />
              <span className="text-parchment/80">{studio.tagline}</span>
            </p>
            <h1 id="hero-title" className="display display-on-media max-w-[18ch] text-display-hero text-parchment sm:max-w-[22ch] md:max-w-none">
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-hero-line className="block md:whitespace-nowrap">
                  A room should know how you <em>live</em>
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.05em]">
                <span data-hero-line className="block md:whitespace-nowrap">before it asks you to stay.</span>
              </span>
            </h1>
            <div data-hero-rule className="hairline mt-4 max-w-md bg-gold/40 sm:mt-7" />
            <div className="mt-4 flex max-w-[36rem] flex-col gap-4 sm:mt-7 sm:gap-6">
              <p
                data-hero-fade
                className="hero-lead-on-media max-w-[28rem] text-[0.9375rem] font-medium leading-relaxed text-parchment sm:text-[0.95rem] md:text-lead md:font-normal md:text-parchment/80"
              >
                Architecture and interiors, shaped with patience and a reverence for material.
              </p>
              <div data-hero-fade className="pointer-events-auto flex flex-wrap gap-2 sm:gap-3">
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

        {/* Tour narrative — safe left band, no collision with scene props */}
        {isTour && (
          <div
            data-hero-tour
            className="pointer-events-none invisible absolute inset-x-0 bottom-[clamp(4.75rem,11vh,8.5rem)] z-20 opacity-0 motion-reduce:hidden"
            aria-live="polite"
          >
            <div className="shell">
              <AnimatePresence mode="sync">
                <motion.div
                  key={stop.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE_LUXE }}
                  className={`relative max-w-[min(34rem,100%)] rounded-sm px-3 py-3 shadow-[inset_0_1px_0_rgba(232,223,208,0.06),0_24px_48px_-28px_rgba(0,0,0,0.7)] sm:px-4 sm:py-4 md:max-w-[36rem] ${
                    isConclusion
                      ? 'bg-[#171717]/80 shadow-[0_0_0_1px_rgba(182,155,117,0.28),inset_0_1px_0_rgba(232,224,210,0.08),0_24px_48px_-28px_rgba(0,0,0,0.7)]'
                      : 'bg-[#171717]/65'
                  }`}
                >
                  <p className={`eyebrow ${isConclusion || holding ? 'text-gold' : 'text-gold/80'}`}>{stop.eyebrow}</p>
                  <p
                    className={`display display-on-media mt-3 text-pretty text-parchment sm:mt-4 ${
                      isConclusion
                        ? 'text-[clamp(1.15rem,0.75rem+1.9vw,2.75rem)] leading-[1.15]'
                        : 'text-[clamp(1.05rem,0.72rem+1.5vw,2.35rem)] leading-[1.18]'
                    }`}
                  >
                    {isConclusion ? (
                      <>
                        If a room could keep only <em>one truth</em> about you — which would you leave on the shelf?
                      </>
                    ) : (
                      stop.line
                    )}
                  </p>
                  {isConclusion && (
                    <div className="pointer-events-auto mt-5 flex flex-wrap gap-3 sm:mt-7">
                      <ArrowLink variant="solid" to="/contact">
                        Begin a conversation
                      </ArrowLink>
                      <ArrowLink variant="outline" to="/atelier">
                        Try the atelier
                      </ArrowLink>
                    </div>
                  )}
                  {isConclusion && (
                    <div
                      className="overflow-hidden transition-none"
                      style={{
                        opacity: holdReveal,
                        maxHeight: `${holdReveal * 3.25}rem`,
                        transform: `translate3d(0, ${(1 - holdReveal) * 14}px, 0)`,
                        willChange: holdReveal > 0 && holdReveal < 1 ? 'opacity, transform, max-height' : undefined,
                      }}
                      aria-hidden={holdReveal < 0.08}
                    >
                      <p className="eyebrow mt-5 text-parchment/55 sm:mt-6">Hold — then continue down</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {!isTour && (
          <div
            data-hero-night
            className="pointer-events-none invisible absolute inset-x-0 bottom-[clamp(5rem,14vh,10rem)] z-10 opacity-0 motion-reduce:hidden"
          >
            <div aria-hidden className="absolute -inset-y-24 right-0 w-full bg-[radial-gradient(60%_70%_at_85%_60%,rgba(16,16,15,0.7),transparent)] md:w-2/3" />
            <div className="shell relative flex justify-end">
              <p className="display display-on-media max-w-[18ch] text-right text-display-hero text-parchment">
                As evening falls, <em>the room</em> changes its voice.
              </p>
            </div>
          </div>
        )}

        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 transition-opacity duration-700 ${
            isConclusion ? 'opacity-0 md:opacity-40' : 'opacity-100'
          }`}
        >
          <div className="shell relative flex items-end justify-between pb-5 sm:pb-6">
            <p data-hero-fade className="eyebrow hidden text-parchment/55 lg:block">
              {webgl ? (isTour ? 'Live 3D tour · Loft interior' : 'Live 3D render · A living room at dusk') : 'A living room in stone and timber'}
            </p>
            <div data-hero-cue className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-parchment/60 sm:bottom-6">
              <span className="eyebrow">{holding ? 'Continue' : touring ? 'Continue' : 'Scroll'}</span>
              <span aria-hidden className="relative block h-9 w-px overflow-hidden bg-parchment/25 sm:h-10">
                <span className="animate-scroll-cue absolute inset-0 bg-gold" />
              </span>
            </div>
            <p data-hero-fade className="eyebrow hidden text-parchment/55 sm:block">
              {isTour ? `${String(stopIndex + 1).padStart(2, '0')} / ${String(houseTourStops.length).padStart(2, '0')}` : 'N° 01 — Residence study'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
