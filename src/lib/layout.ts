/**
 * Stable viewport height for sticky stages (ported from Magical Works).
 *
 * Mobile browsers resize the window while the address bar collapses mid-scroll.
 * A tour runway of N × --app-height must not follow those resizes — that changes
 * document length mid-swipe and makes ScrollTrigger feel stuck.
 *
 * Touch / tablet: leave --app-height to CSS (`100lvh`) and only react to width
 * (rotation). Desktop: write a measured px value on real resize.
 * Deliberately ignores `visualViewport` — chasing it causes chrome-flicker jitter.
 */

let lockedAppHeight = 0
let lastWidth = 0

function usesMobileLayoutViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 1023px)').matches || window.matchMedia('(pointer: coarse)').matches
}

function notifyHeightChange() {
  window.dispatchEvent(new CustomEvent('arha:app-height'))
}

/** Write `--app-height`. Height-only resizes are ignored on mobile. */
export function syncAppHeight({ force = false } = {}) {
  if (typeof window === 'undefined') return 0

  const root = document.documentElement
  const width = window.innerWidth
  const widthChanged = width !== lastWidth

  if (usesMobileLayoutViewport()) {
    if (!force && !widthChanged) return lockedAppHeight
    lastWidth = width
    lockedAppHeight = Math.round(window.innerHeight)
    root.style.removeProperty('--app-height')
    notifyHeightChange()
    return lockedAppHeight
  }

  const measured = Math.round(window.innerHeight)
  if (force || widthChanged || measured !== lockedAppHeight) {
    lockedAppHeight = Math.max(measured, 1)
    lastWidth = width
    root.style.setProperty('--app-height', `${lockedAppHeight}px`)
    notifyHeightChange()
  }

  return lockedAppHeight
}

/** Keep `--app-height` on the layout viewport. Returns cleanup. */
export function bindAppHeightSync() {
  if (typeof window === 'undefined') return () => {}

  let raf = 0
  const sync = (force = false) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => syncAppHeight({ force }))
  }

  sync(true)

  const onResize = () => sync(false)
  const onOrientation = () => {
    window.setTimeout(() => sync(true), 150)
    window.setTimeout(() => sync(true), 400)
  }

  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onOrientation)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onOrientation)
  }
}
