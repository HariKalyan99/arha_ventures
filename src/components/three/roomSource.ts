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
 * Active hero model — meshopt + WebP optimized.
 * City exterior meshes are still stripped at load.
 *
 * Re-optimize with palette OFF (palette + quantized UVs crush glass/walls):
 *   npx @gltf-transform/cli optimize free_loft_17.glb free_loft_17.opt.glb \
 *     --compress meshopt --texture-compress webp --palette false
 */
export const LIVING_ROOM_GLB = '/models/free_loft_17.glb'

/** Target horizontal span (metres) after normalising the interior (city excluded). */
export const LIVING_ROOM_TARGET_SPAN = 14

/** Yaw applied before fit. */
export const LIVING_ROOM_YAW = 0
