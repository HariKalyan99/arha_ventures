/**
 * Room sources — hero tour and atelier are independent.
 * - Hero uses the imported loft GLB (scroll tour).
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
 * Active hero model — free loft (city exterior meshes are stripped at load).
 * Alternatives: '/models/loft_interior_6_for_free.glb' | '/models/living_room_interior_free_v2.glb'
 */
export const LIVING_ROOM_GLB = '/models/free_loft_17.glb'

/** Target horizontal span (metres) after normalising the interior (city excluded). */
export const LIVING_ROOM_TARGET_SPAN = 14

/** Yaw applied before fit. */
export const LIVING_ROOM_YAW = 0
