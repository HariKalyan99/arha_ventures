import * as THREE from 'three'
import type { LightingMood } from '../../data/configurator'

/** Every value the lighting system interpolates when the mood changes. */
export interface MoodParams {
  sunColor: THREE.Color
  sunIntensity: number
  sunPosition: THREE.Vector3
  hemiSky: THREE.Color
  hemiGround: THREE.Color
  hemiIntensity: number
  envIntensity: number
  exposure: number
  /** 0–1 multiplier for interior artificial light (lamps, cove, pendants) */
  lamp: number
  fire: number
  skyTop: THREE.Color
  skyHorizon: THREE.Color
  skyGlow: THREE.Color
  glowStrength: number
  sea: THREE.Color
  pool: number
}

const c = (hex: string) => new THREE.Color(hex)
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export const moods: Record<LightingMood, MoodParams> = {
  daylight: {
    /* Even, airy interior — soft fill, no hard pools */
    sunColor: c('#fff6e8'),
    sunIntensity: 2.4,
    sunPosition: v(8, 14, -8),
    hemiSky: c('#e8eef0'),
    hemiGround: c('#c4b09a'),
    hemiIntensity: 1.45,
    envIntensity: 1.15,
    exposure: 1.12,
    lamp: 0.02,
    fire: 0.2,
    skyTop: c('#9bb4c8'),
    skyHorizon: c('#f0ebe3'),
    skyGlow: c('#fff8ec'),
    glowStrength: 0.28,
    sea: c('#5a7580'),
    pool: 0.04,
  },
  evening: {
    /* Late afternoon — still readable, warm without murk */
    sunColor: c('#ffc9a0'),
    sunIntensity: 2.1,
    sunPosition: v(-10, 6.5, -10),
    hemiSky: c('#d8c4b4'),
    hemiGround: c('#8a6f58'),
    hemiIntensity: 1.05,
    envIntensity: 0.85,
    exposure: 1.08,
    lamp: 0.18,
    fire: 0.4,
    skyTop: c('#6a7a96'),
    skyHorizon: c('#e8b892'),
    skyGlow: c('#ffd0a0'),
    glowStrength: 0.55,
    sea: c('#4a5560'),
    pool: 0.12,
  },
  night: {
    // Quieter evening — lamps take over without going murky
    sunColor: c('#7a8bb5'),
    sunIntensity: 0.35,
    sunPosition: v(10, 11, -12),
    hemiSky: c('#2c3444'),
    hemiGround: c('#160f0b'),
    hemiIntensity: 0.28,
    envIntensity: 0.28,
    exposure: 1.15,
    lamp: 1,
    fire: 1,
    skyTop: c('#080b13'),
    skyHorizon: c('#1a2032'),
    skyGlow: c('#333a55'),
    glowStrength: 0.25,
    sea: c('#0b0e15'),
    pool: 1,
  },
}

export function cloneMood(m: MoodParams): MoodParams {
  return {
    ...m,
    sunColor: m.sunColor.clone(),
    sunPosition: m.sunPosition.clone(),
    hemiSky: m.hemiSky.clone(),
    hemiGround: m.hemiGround.clone(),
    skyTop: m.skyTop.clone(),
    skyHorizon: m.skyHorizon.clone(),
    skyGlow: m.skyGlow.clone(),
    sea: m.sea.clone(),
  }
}

const scalarKeys = ['sunIntensity', 'hemiIntensity', 'envIntensity', 'exposure', 'lamp', 'fire', 'glowStrength', 'pool'] as const
const colorKeys = ['sunColor', 'hemiSky', 'hemiGround', 'skyTop', 'skyHorizon', 'skyGlow', 'sea'] as const

/** Writes the blend of `a` and `b` at `t` into `out` without allocating. */
export function mixMood(a: MoodParams, b: MoodParams, t: number, out: MoodParams) {
  for (const k of scalarKeys) out[k] = THREE.MathUtils.lerp(a[k], b[k], t)
  for (const k of colorKeys) out[k].lerpColors(a[k], b[k], t)
  out.sunPosition.lerpVectors(a.sunPosition, b.sunPosition, t)
  return out
}

/** Frame-rate independent approach of `current` towards `target`. */
export function dampMood(current: MoodParams, target: MoodParams, lambda: number, dt: number) {
  const k = 1 - Math.exp(-lambda * dt)
  for (const key of scalarKeys) current[key] += (target[key] - current[key]) * k
  for (const key of colorKeys) current[key].lerp(target[key], k)
  current.sunPosition.lerp(target.sunPosition, k)
}
