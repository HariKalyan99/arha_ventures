/**
 * Interior tour for sraven-interior.
 * Fitted on the furnished core (span 14m, floor y=0).
 *
 * Path: kitchen → living → stair climb → upper landing.
 * Kitchen start is the reverse of the locked sofa→island frame.
 *
 * `mobile` poses reframe for phone + md tablet (below lg).
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

/** Bounds cover kitchen, living aisle, and the stair climb. */
export const TOUR_CAMERA_BOUNDS = {
  min: [-2.2, 1.2, -4.5] as [number, number, number],
  max: [3.5, 3.8, 4.8] as [number, number, number],
}

/** Below Tailwind `lg` — phone and md tablet use compact tour framing. */
export const TOUR_MOBILE_MAX_WIDTH = 1023

/** Tailwind `md` floor — same look-ats as phone, slightly wider FOV. */
export const TOUR_MD_MIN_WIDTH = 768

/**
 * Locked living→kitchen frame (sofa, island, NetTV, fire):
 *   eye [0.58, 1.55, -0.7] → look [3.27, 1.15, -4.2]
 * Kitchen start stands near that look-at, facing back into living.
 */
export const houseTourStops: TourStop[] = [
  {
    id: 'kitchen',
    short: 'Kitchen',
    eyebrow: '01 — The daily plan',
    line: 'From the island, the living room opens — work and rest in one air.',
    position: [3.05, 1.48, -3.85],
    target: [0.45, 1.3, -0.35],
    fov: 50,
    mobile: {
      position: [2.75, 1.45, -3.55],
      target: [0.55, 1.25, -0.45],
      fov: 46,
    },
  },
  {
    id: 'living',
    short: 'Living',
    eyebrow: '02 — The gathering',
    line: 'Sofa, fire and screen — then the stair begins to pull the eye upward.',
    // Same open volume as the locked living frame, looking toward the stair.
    position: [0.58, 1.52, -0.55],
    target: [-1.45, 2.05, 3.25],
    fov: 50,
    mobile: {
      position: [0.5, 1.48, -0.35],
      target: [-1.25, 1.95, 2.85],
      fov: 46,
    },
  },
  {
    id: 'stair-base',
    short: 'Stair',
    eyebrow: '03 — The ascent',
    line: 'Dark treads, pale stringer — the climb framed like a second room.',
    // Stay in the open living volume — look up the stair, don’t enter the well.
    position: [-0.35, 1.55, 1.15],
    target: [-1.65, 3.05, 4.35],
    fov: 48,
    mobile: {
      position: [-0.2, 1.5, 1.35],
      target: [-1.45, 2.85, 4.0],
      fov: 44,
    },
  },
  {
    id: 'stair-mid',
    short: 'Climb',
    eyebrow: '04 — Halfway up',
    line: 'Height rewrites the plan — the rooms below settle into one thought.',
    // Rise in open air beside the run (avoids wall / soffit blackouts).
    position: [-0.75, 2.55, 2.15],
    target: [-1.55, 3.45, 4.55],
    fov: 46,
    mobile: {
      position: [-0.55, 2.4, 2.0],
      target: [-1.35, 3.25, 4.25],
      fov: 42,
    },
  },
  {
    id: 'upper',
    short: 'Above',
    eyebrow: '05 — And then',
    line: 'From above, the plan softens — and you see what was worth keeping.',
    // High overlook back toward living + kitchen.
    position: [-1.05, 3.45, 2.95],
    target: [1.65, 1.35, -2.15],
    fov: 50,
    mobile: {
      position: [-0.85, 3.25, 2.75],
      target: [1.35, 1.3, -1.85],
      fov: 46,
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
  const fov = width >= TOUR_MD_MIN_WIDTH ? Math.min(baseFov + 4, 52) : baseFov
  return {
    position: stop.mobile.position ?? stop.position,
    target: stop.mobile.target ?? stop.target,
    fov,
  }
}

/** Tour travels through stops for most of the scroll, then holds briefly on the final stop. */
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
 * Eases in as the final hold begins, then stays visible through the end.
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
