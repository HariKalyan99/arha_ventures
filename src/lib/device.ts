export type QualityTier = 'high' | 'medium' | 'low'

let webglSupport: boolean | undefined

export function hasWebGL(): boolean {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    webglSupport = !!gl
    // Release the probe context immediately so it doesn't count against the browser's context limit.
    ;(gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/**
 * Coarse device capability estimate used to scale 3D rendering:
 * pixel ratio, shadow map size and texture resolution.
 * Phones stay on `medium` (sharp DPR) unless the device is clearly weak.
 */
export function getQualityTier(): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 600

  /* Only very constrained hardware drops to low (soft 1× DPR used to hurt phones here). */
  if (cores <= 2 || memory <= 2) return 'low'
  if (coarse || small || cores <= 4 || memory <= 3) return 'medium'
  return 'high'
}

export const tierSettings: Record<
  QualityTier,
  { dpr: [number, number]; shadowMapSize: number; textureSize: number; shadows: boolean }
> = {
  /* Cap near devicePixelRatio so Retina / phone screens stay crisp */
  high: { dpr: [1.25, 2], shadowMapSize: 2048, textureSize: 1024, shadows: true },
  medium: { dpr: [1.35, 2], shadowMapSize: 1536, textureSize: 1024, shadows: true },
  /* Atelier procedural maps stay usable on weak phones */
  low: { dpr: [1.15, 1.75], shadowMapSize: 512, textureSize: 768, shadows: false },
}
