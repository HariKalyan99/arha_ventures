/**
 * Interior tour for free_loft_17 (fitted span 14m, floor y=0).
 * Copy advances with the camera — last stop is the shelf + curious close.
 *
 * `mobile` poses reframe for phone + md tablet (below lg):
 * less ceiling, teapoy/plaque framing, FOV kept calmer.
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
  /** Optional override when viewport width < lg (1024) — phone + md tablet */
  mobile?: Partial<TourPose>
}

/** Eye stays inside the loft, with room to travel between zones. */
export const TOUR_CAMERA_BOUNDS = {
  min: [-4.8, 1.15, -5.0] as [number, number, number],
  max: [5.2, 3.85, 6.2] as [number, number, number],
}

/** Below Tailwind `lg` — phone and md tablet use compact tour framing. */
export const TOUR_MOBILE_MAX_WIDTH = 1023

/** Tailwind `md` floor — same teapoy targets as phone, slightly wider FOV. */
export const TOUR_MD_MIN_WIDTH = 768

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
      // Opening: bias left toward the lounge teapoy / plaque (≈ -2.84, 1.18, 2.38).
      position: [0.55, 1.58, 5.55],
      target: [-2.84, 1.05, 2.25],
      fov: 40,
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
      // Stay with the teapoy a beat longer before the tour drifts right.
      position: [0.85, 1.52, 3.9],
      target: [-2.7, 0.9, 2.05],
      fov: 42,
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
      // Same stairs-top plan as desktop — spiral right, lounge + plaque below.
      // Slight look bias toward the plaque so it stays in a narrow/md frame.
      position: [2.2, 3.9, 2.8],
      target: [-2.55, 1.25, 1.05],
      fov: 46,
    },
  },
  {
    id: 'overview',
    short: 'Across',
    eyebrow: '05 — Beyond the glass',
    line: 'A home should borrow the skyline quietly — outlook as considered as the structure that frames it.',
    position: [1.8, 1.85, 4.8],
    target: [-2.4, 1.15, 0.2],
    fov: 50,
    mobile: {
      // Close 3/4 on the lounge teapoy — Call Us handset + plaque readable.
      position: [-0.35, 1.45, 4.15],
      target: [-2.84, 0.7, 2.38],
      fov: 40,
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

/** Resolve desktop or compact (phone / md) pose for a stop. */
export function tourPoseFor(stop: TourStop, compact: boolean, width = 0): TourPose {
  if (!compact || !stop.mobile) {
    return { position: stop.position, target: stop.target, fov: stop.fov }
  }
  const baseFov = stop.mobile.fov ?? stop.fov
  /* md tablets share phone look-ats; open FOV a touch so the frame isn’t pinched. */
  const fov = width >= TOUR_MD_MIN_WIDTH ? Math.min(baseFov + 4, 48) : baseFov
  return {
    position: stop.mobile.position ?? stop.position,
    target: stop.mobile.target ?? stop.target,
    fov,
  }
}

/**
 * Raw sticky scroll → camera progress.
 * Tour travels through stops for most of the scroll, then holds on the final
 * shelf / question so the ending can breathe before the page continues down.
 */
/** Tour travels through stops for most of the scroll, then holds briefly on the final shelf. */
export const TOUR_TRAVEL_END = 0.82

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
