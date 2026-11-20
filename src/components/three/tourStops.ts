/**
 * Interior tour for free_loft_17 (fitted span 14m, floor y=0).
 * Copy advances with the camera — last stop is the shelf + curious close.
 *
 * `mobile` poses reframe for narrow / portrait viewports (md and below):
 * less ceiling, more of the living plane, FOV kept calmer.
 */
export interface TourPose {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

export interface TourStop extends TourPose {
  id: string
  short: string
  /** Small gold eyebrow above the line */
  eyebrow: string
  /** Display line shown while this station is active */
  line: string
  /** Optional override when viewport width < 768 */
  mobile?: Partial<TourPose>
}

/** Eye stays inside the loft, with room to travel between zones. */
export const TOUR_CAMERA_BOUNDS = {
  min: [-4.8, 1.15, -5.0] as [number, number, number],
  max: [5.2, 3.55, 6.2] as [number, number, number],
}

/** Match Tailwind `md` — below this we use mobile tour framing. */
export const TOUR_MOBILE_MAX_WIDTH = 767

export const houseTourStops: TourStop[] = [
  {
    id: 'living',
    short: 'Living',
    eyebrow: '01 — The volume',
    line: 'First, height. A room that lets the ceiling finish the sentence.',
    position: [-0.7, 1.7, 5.0],
    target: [-2.95, 1.42, 1.45],
    fov: 48,
    mobile: {
      // Same lounge beat as desktop, but pulled back and aimed lower so phones don’t see ceiling.
      position: [-0.35, 1.64, 5.7],
      target: [-2.55, 1.05, 1.4],
      fov: 41,
    },
  },
  {
    id: 'seating',
    short: 'Lounge',
    eyebrow: '02 — The gathering',
    line: 'Then the low seat — so conversation can find its own light.',
    position: [0.4, 1.48, 3.2],
    target: [-2.9, 1.0, 1.5],
    fov: 50,
    mobile: {
      position: [0.7, 1.55, 3.85],
      target: [-2.35, 0.95, 1.35],
      fov: 44,
    },
  },
  {
    id: 'kitchen',
    short: 'Kitchen',
    eyebrow: '03 — The daily plan',
    line: 'Work and rest share one floor. Rituals should not feel like a corridor.',
    position: [0.6, 1.55, 1.8],
    target: [-3.4, 1.05, -0.9],
    fov: 48,
    mobile: {
      position: [0.75, 1.58, 2.15],
      target: [-3.15, 0.98, -0.75],
      fov: 45,
    },
  },
  {
    id: 'mezzanine',
    short: 'Mezzanine',
    eyebrow: '04 — The return look',
    line: 'From above, the plan softens — and you see what was worth keeping.',
    position: [2.2, 3.9, 2.8],
    target: [-2.4, 1.5, 0.6],
    fov: 48,
    mobile: {
      // From the lounge side of the mezz — plan below, spiral out of the phone frame.
      position: [-0.35, 3.35, 2.35],
      target: [-2.85, 0.95, 1.35],
      fov: 42,
    },
  },
  {
    id: 'overview',
    short: 'Across',
    eyebrow: '05 — Across the loft',
    line: 'One continuous thought — floors, light and material in a single air.',
    position: [1.8, 1.85, 4.8],
    target: [-2.4, 1.15, 0.2],
    fov: 50,
    mobile: {
      position: [1.65, 1.72, 5.15],
      target: [-2.2, 1.0, 0.35],
      fov: 46,
    },
  },
  {
    id: 'shelf',
    short: 'Shelf',
    eyebrow: '06 — And then',
    line: 'If a room could keep only one truth about you — which would you leave on the shelf?',
    position: [0.9, 1.52, 1.9],
    target: [3.55, 1.35, -0.55],
    fov: 40,
    mobile: {
      position: [0.7, 1.48, 2.15],
      target: [3.35, 1.28, -0.45],
      fov: 38,
    },
  },
]

/** Resolve desktop or mobile pose for a stop. */
export function tourPoseFor(stop: TourStop, mobile: boolean): TourPose {
  if (!mobile || !stop.mobile) {
    return { position: stop.position, target: stop.target, fov: stop.fov }
  }
  return {
    position: stop.mobile.position ?? stop.position,
    target: stop.mobile.target ?? stop.target,
    fov: stop.mobile.fov ?? stop.fov,
  }
}

/**
 * Raw sticky scroll → camera progress.
 * Tour travels through stops for most of the scroll, then holds on the final
 * shelf / question so the ending can breathe before the page continues down.
 */
export const TOUR_TRAVEL_END = 0.72

export function mapTourScrollProgress(raw: number) {
  const p = Math.min(1, Math.max(0, raw))
  if (p <= TOUR_TRAVEL_END) return p / TOUR_TRAVEL_END
  return 1
}

/** True while the final frame is held before the sticky section releases. */
export function isTourHold(raw: number) {
  return Math.min(1, Math.max(0, raw)) > TOUR_TRAVEL_END
}

/**
 * 0–1 reveal for the “Hold — then continue” cue.
 * Eases in as the shelf hold begins, then stays visible through the end.
 */
export function tourHoldReveal(raw: number) {
  const p = Math.min(1, Math.max(0, raw))
  const enterStart = TOUR_TRAVEL_END
  const enterEnd = TOUR_TRAVEL_END + 0.1
  if (p <= enterStart) return 0
  if (p >= enterEnd) return 1
  const t = (p - enterStart) / (enterEnd - enterStart)
  return t * t * (3 - 2 * t)
}

/** Active stop index for UI (snaps to nearest station). Pass mapped tour progress. */
export function tourStopAt(progress: number) {
  const n = houseTourStops.length
  if (n <= 1) {
    return { index: 0, blend: 0, displayIndex: 0, stop: houseTourStops[0], next: houseTourStops[0], active: houseTourStops[0] }
  }
  const scaled = Math.min(1, Math.max(0, progress)) * (n - 1)
  const index = Math.min(n - 2, Math.floor(scaled))
  const blend = scaled - index
  const displayIndex = Math.min(n - 1, Math.round(scaled))
  return {
    index,
    blend,
    displayIndex,
    stop: houseTourStops[index],
    next: houseTourStops[index + 1],
    active: houseTourStops[displayIndex],
  }
}
