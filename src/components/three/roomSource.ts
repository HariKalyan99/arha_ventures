/**
 * Room sources — hero tour and atelier are independent.
 * - Hero uses the imported interior GLB (scroll tour).
 * - Atelier always uses the hand-built procedural room so finishes / moods apply.
 */
export type RoomSource = 'glb' | 'procedural'

/** Hero / home scroll tour */
export const HERO_ROOM_SOURCE: RoomSource = 'glb'

/** Interactive atelier — procedural so floor / wall / upholstery / metal / light work */
export const ATELIER_ROOM_SOURCE: RoomSource = 'procedural'

/** @deprecated Prefer HERO_ROOM_SOURCE or ATELIER_ROOM_SOURCE — kept for hero tour checks */
export const ROOM_SOURCE: RoomSource = HERO_ROOM_SOURCE

/**
 * Active hero model — Sraven interior (meshopt + webp).
 * Alternatives: '/models/free_loft_17.glb' | '/models/loft_interior_6_for_free.glb'
 */
export const LIVING_ROOM_GLB = '/models/sraven-interior.glb'

/**
 * Target horizontal span (metres) of the furnished core after fit.
 * Core is ~11.7 × 14m with multi-storey height (~8m).
 */
export const LIVING_ROOM_TARGET_SPAN = 14

/** Yaw applied before fit. */
export const LIVING_ROOM_YAW = 0
