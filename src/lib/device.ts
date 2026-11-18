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
 */
export function getQualityTier(): QualityTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 600

  if (cores <= 4 || memory <= 3) return 'low'
  if (coarse || small) return 'medium'
  return 'high'
}

export const tierSettings: Record<QualityTier, { dpr: [number, number]; shadowMapSize: number; textureSize: number; shadows: boolean }> = {
  high: { dpr: [1, 1.75], shadowMapSize: 2048, textureSize: 1024, shadows: true },
  medium: { dpr: [1, 1.5], shadowMapSize: 1024, textureSize: 1024, shadows: true },
  low: { dpr: [1, 1], shadowMapSize: 512, textureSize: 512, shadows: false },
}
