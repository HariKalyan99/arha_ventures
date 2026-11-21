/**
 * First-paint gate: BootLoader holds #boot until the hero loft signals ready
 * (or WebGL is unavailable / the landing route isn’t home).
 */

let settled = false
let resolveReady: (() => void) | null = null

export const whenHeroReady = new Promise<void>((resolve) => {
  resolveReady = resolve
})

/** Call once the hero canvas has painted (or static fallback is up). */
export function signalHeroReady() {
  if (settled) return
  settled = true
  resolveReady?.()
  resolveReady = null
}

export function isHeroReady() {
  return settled
}
