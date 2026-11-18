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
    sunColor: c('#fff0da'),
    sunIntensity: 3.4,
    sunPosition: v(9, 12, -10),
    hemiSky: c('#dde4e6'),
    hemiGround: c('#a38d70'),
    hemiIntensity: 1.1,
    envIntensity: 0.9,
    exposure: 0.95,
    lamp: 0.04,
    fire: 0.35,
    skyTop: c('#7e9fba'),
    skyHorizon: c('#e6e1d4'),
    skyGlow: c('#fff1d6'),
    glowStrength: 0.35,
    sea: c('#4d6670'),
    pool: 0.05,
  },
  evening: {
    // Warm dusk — natural midtones, soft amber key
    sunColor: c('#ffb07a'),
    sunIntensity: 3.8,
    sunPosition: v(-12, 3.8, -11),
    hemiSky: c('#c4a090'),
    hemiGround: c('#3d2c22'),
    hemiIntensity: 0.58,
    envIntensity: 0.52,
    exposure: 1.05,
    lamp: 0.5,
    fire: 0.85,
    skyTop: c('#323a52'),
    skyHorizon: c('#e8925a'),
    skyGlow: c('#ffb36b'),
    glowStrength: 1,
    sea: c('#3a3540'),
    pool: 0.25,
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
