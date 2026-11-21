import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { LOGO_ON_DARK_SRC, LOGO_SRC } from '../../data/brand'
import { hasWebGL } from '../../lib/device'
import { whenHeroReady, signalHeroReady } from '../../lib/heroBoot'
import { readStoredTheme } from '../../lib/theme'
import { LIVING_ROOM_GLB } from '../three/roomSource'

const RISE_MS = 2400
const MIN_MS = 2800
/** Large meshopt loft — give the first paint time to finish under the splash. */
const MAX_MS = 22000
const FADE_MS = 850

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<void>((r) => {
      window.setTimeout(r, ms)
    }),
  ])
}

function dismissBoot(el: HTMLElement) {
  if (el.classList.contains('is-done')) return
  el.classList.add('is-done')
  document.documentElement.classList.remove('is-booting')
  window.setTimeout(() => el.remove(), FADE_MS + 40)
}

function isHomePath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return path === '/'
}

/**
 * First-paint boot screen (markup in index.html).
 * On home + WebGL: holds until the loft has painted a frame, then opens the site.
 * Other routes (or no WebGL): opens after logo rise / fonts.
 */
export function BootLoader() {
  useEffect(() => {
    const el = document.getElementById('boot')
    if (!el) return

    document.documentElement.classList.add('is-booting')
    let cancelled = false
    const started = performance.now()
    const home = isHomePath()
    const webgl = hasWebGL()

    const failsafe = window.setTimeout(() => {
      if (!cancelled) {
        signalHeroReady()
        dismissBoot(el)
      }
    }, MAX_MS)

    ;(async () => {
      try {
        await withTimeout(
          Promise.all([
            document.fonts?.ready ?? Promise.resolve(),
            loadImage(readStoredTheme() === 'dark' ? LOGO_ON_DARK_SRC : LOGO_SRC),
          ]),
          2000,
        )
      } catch {
        /* ignore */
      }
      if (cancelled) return

      /* Warm the loft cache before / while the hero mounts under the splash. */
      if (home && webgl) {
        try {
          const preload = Promise.resolve(useGLTF.preload(LIVING_ROOM_GLB, false, true) as unknown as void)
          await withTimeout(preload, MAX_MS - 4000)
        } catch {
          /* still wait for hero / failsafe */
        }
      } else {
        /* Non-home or no WebGL — don’t block the splash on the loft. */
        signalHeroReady()
      }
      if (cancelled) return

      if (home && webgl) {
        const remaining = Math.max(1200, MAX_MS - (performance.now() - started) - 200)
        await withTimeout(whenHeroReady, remaining)
      }
      if (cancelled) return

      const wait = Math.max(RISE_MS, MIN_MS) - (performance.now() - started)
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      if (cancelled) return

      dismissBoot(el)
      window.clearTimeout(failsafe)
    })()

    return () => {
      cancelled = true
      window.clearTimeout(failsafe)
    }
  }, [])

  return null
}
