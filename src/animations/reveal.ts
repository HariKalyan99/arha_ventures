import type { RefObject } from 'react'
import { gsap, MOTION_QUERY, ScrollTrigger, useGSAP } from '../lib/gsap'

/**
 * Declarative scroll animations. Sections mark elements with data attributes and
 * call useReveal(ref); all tweens are created inside a gsap.matchMedia block so
 * nothing animates (and nothing is hidden) for visitors who prefer reduced motion.
 *
 *  data-reveal="fade"   – rise and fade in
 *  data-reveal="lines"  – children [data-line] slide up from a mask
 *  data-reveal="words"  – children [data-word] brighten as you scroll (scrubbed)
 *  data-reveal="image"  – clip-path wipe; the first <img> settles from a zoom
 *  data-reveal="rule"   – hairline draws from the left
 *  data-parallax="n"    – drifts ±n% vertically while its parent crosses the viewport
 */
export function registerReveals(scope: HTMLElement) {
  const q = gsap.utils.selector(scope)
  const once = (trigger: Element, start = 'top 86%') => ({
    trigger,
    start,
    once: true,
    invalidateOnRefresh: true,
  })

  q('[data-reveal="fade"]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 36,
      duration: 1.4,
      delay: Number((el as HTMLElement).dataset.delay ?? 0),
      scrollTrigger: once(el),
    })
  })

  q('[data-reveal="lines"]').forEach((el) => {
    gsap.from(el.querySelectorAll('[data-line]'), {
      yPercent: 115,
      duration: 1.6,
      stagger: 0.09,
      scrollTrigger: once(el, 'top 88%'),
    })
  })

  q('[data-reveal="words"]').forEach((el) => {
    gsap.fromTo(
      el.querySelectorAll('[data-word]'),
      { opacity: 0.16 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  })

  q('[data-reveal="image"]').forEach((el) => {
    const img = el.querySelector('img')
    const tl = gsap.timeline({ scrollTrigger: once(el, 'top 88%') })
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut' })
    if (img) tl.fromTo(img, { scale: 1.28 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0.15)
  })

  q('[data-reveal="rule"]').forEach((el) => {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.8,
      ease: 'expo.inOut',
      scrollTrigger: once(el, 'top 92%'),
    })
  })

  q('[data-parallax]').forEach((el) => {
    const parent = el.parentElement
    if (!parent) return
    const amount = Number((el as HTMLElement).dataset.parallax || 8)
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: parent,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  })

  /* SPA route enters often create triggers before scroll/layout settle — refresh,
     then finish any once-animation already past its start so content isn't left
     at autoAlpha:0 / clip-path inset(100%). */
  ScrollTrigger.refresh()
  const y = ScrollTrigger.scroll()
  ScrollTrigger.getAll().forEach((st) => {
    const trigger = st.trigger as Element | null
    if (!trigger || !scope.contains(trigger)) return
    if (!st.vars.once || !st.animation) return
    if (st.start <= y + 1) st.animation.progress(1)
  })
}

export function useReveal(scope: RefObject<HTMLElement | null>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      if (!scope.current) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_QUERY, () => {
        try {
          registerReveals(scope.current!)
        } catch (err) {
          /* Stale ScrollTriggers from a previous route can throw during refresh.
             Reveal content instead of leaving it invisible. */
          console.warn('[reveal] fallback visible', err)
          const root = scope.current
          if (!root) return
          root.querySelectorAll<HTMLElement>('[data-reveal], [data-line], [data-word], [data-parallax]').forEach((el) => {
            gsap.set(el, { clearProps: 'all' })
          })
        }
      })
    },
    { scope, dependencies, revertOnUpdate: true },
  )
}
