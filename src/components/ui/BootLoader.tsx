import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { LOGO_ON_DARK_SRC, LOGO_SRC } from '../../data/brand'
import { readStoredTheme } from '../../lib/theme'
import { LIVING_ROOM_GLB } from '../three/roomSource'

const RISE_MS = 2400
const MIN_MS = 2800
const MAX_MS = 6000
const FADE_MS = 850

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function withTimeout(promise: Promise<unknown>, ms: number) {
  return Promise.race([promise, new Promise<void>((r) => setTimeout(r, ms))])
}

function dismissBoot(el: HTMLElement) {
  if (el.classList.contains('is-done')) return
  el.classList.add('is-done')
  document.documentElement.classList.remove('is-booting')
  window.setTimeout(() => el.remove(), FADE_MS + 40)
}

/**
 * First-paint boot screen (markup in index.html).
 * Holds for the logo rise, then opens the site. The hero GLB preloads in the
 * background so a large model never blocks entry to the home page.
 */
export function BootLoader() {
  useEffect(() => {
    const el = document.getElementById('boot')
    if (!el) return

    document.documentElement.classList.add('is-booting')
    let cancelled = false
    const started = performance.now()

    try {
      useGLTF.preload(LIVING_ROOM_GLB)
    } catch {
      /* preload is best-effort */
    }

    const failsafe = window.setTimeout(() => {
      if (!cancelled) dismissBoot(el)
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
