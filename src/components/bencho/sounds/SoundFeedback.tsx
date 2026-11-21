import { useEffect } from 'react'
import { play } from './sounds'

/** Same interactive set as the custom cursor — links, buttons, and role proxies. */
const INTERACTIVE =
  'a[href], button, label, summary, [role="button"], [role="link"], .link-line, [data-cursor="hover"]'

function isInteractive(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE))
}

/**
 * Global UI audio — Paid on links/buttons.
 * Keyboard activation of interactive controls also plays Paid (click detail === 0).
 * Particles ([data-bencho-sound]), plaque (glide), and phone (nib) play their own cues.
 */
export function SoundFeedback() {
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      /* Elements with data-bencho-sound play their own cue (e.g. particles → clack). */
      if (e.target instanceof Element && e.target.closest('[data-bencho-sound]')) return
      if (isInteractive(e.target)) play('paid')
    }

    const onClick = (e: MouseEvent) => {
      /* Keyboard / assistive activation only — pointer already handled above. */
      if (e.detail !== 0) return
      if (isInteractive(e.target)) play('paid')
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('click', onClick, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
