import { useLayoutEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import type { LightingMood } from '../../data/configurator'
import { cloneMood, dampMood, mixMood, moods } from './moods'
import { ROOM, useRoom } from './roomContext'

export interface MoodBlend {
  from: LightingMood
  to: LightingMood
  /** 0–1, read every frame (e.g. scroll progress) */
  progress: RefObject<number>
}

interface LightingProps {
  mood: LightingMood
  /** When provided, the target mood is a live blend instead of `mood`. */
  blend?: MoodBlend
}

export function Lighting({ mood, blend }: LightingProps) {
  const { rig, tier } = useRoom()
  const { gl, scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const fireLight = useRef<THREE.PointLight>(null)
  const washes = useRef<(THREE.SpotLight | null)[]>([])
  const current = useRef(cloneMood(moods[mood]))
  const target = useRef(cloneMood(moods[mood]))
  const settings = tier === 'low' ? { shadow: 512, washes: false } : tier === 'medium' ? { shadow: 1024, washes: true } : { shadow: 2048, washes: true }

  useLayoutEffect(() => {
    const light = sun.current
    if (!light) return
    light.target.position.set(0, 0, 0)
    light.target.updateMatrixWorld()
    washes.current.forEach((spot, i) => {
      if (!spot) return
      spot.target.position.set(ROOM.minX, 0.6, [-3.2, 2.2, 3.9][i])
      spot.target.updateMatrixWorld()
    })
  }, [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    if (blend) mixMood(moods[blend.from], moods[blend.to], THREE.MathUtils.clamp(blend.progress.current ?? 0, 0, 1), target.current)
    else mixMood(moods[mood], moods[mood], 0, target.current)
    dampMood(current.current, target.current, blend ? 6 : 2.4, dt)
    const m = current.current

    if (sun.current) {
      sun.current.color.copy(m.sunColor)
      sun.current.intensity = m.sunIntensity
      sun.current.position.copy(m.sunPosition)
    }
    if (hemi.current) {
      hemi.current.color.copy(m.hemiSky)
      hemi.current.groundColor.copy(m.hemiGround)
      hemi.current.intensity = m.hemiIntensity
    }
    scene.environmentIntensity = m.envIntensity
    gl.toneMappingExposure = m.exposure

    rig.levels.lamp = m.lamp
    rig.levels.fire = m.fire
    rig.bulb.emissiveIntensity = 0.2 + m.lamp * 7
    rig.cove.emissiveIntensity = m.lamp * 5
    rig.pendant.emissiveIntensity = m.lamp * 8
    rig.pool.emissiveIntensity = m.pool * 0.9
    rig.sea.color.copy(m.sea)
    // Atmospheric perspective: distant land sits close to the horizon colour
    rig.hills.color.copy(m.skyHorizon).lerp(m.skyTop, 0.35).multiplyScalar(0.72)

    const sky = rig.sky.uniforms
    ;(sky.uTop.value as THREE.Color).copy(m.skyTop)
    ;(sky.uHorizon.value as THREE.Color).copy(m.skyHorizon)
    ;(sky.uGlow.value as THREE.Color).copy(m.skyGlow)
    sky.uGlowStrength.value = m.glowStrength
    ;(sky.uSunDir.value as THREE.Vector3).copy(m.sunPosition).normalize()

    rig.fire.uniforms.uTime.value = state.clock.elapsedTime
    rig.fire.uniforms.uIntensity.value = m.fire
    if (fireLight.current) {
      const t = state.clock.elapsedTime
      const flicker = 0.85 + Math.sin(t * 9.1) * 0.06 + Math.sin(t * 23.7) * 0.05 + Math.sin(t * 3.3) * 0.04
      fireLight.current.intensity = m.fire * 3.2 * flicker
    }
    washes.current.forEach((spot) => {
      if (spot) spot.intensity = m.lamp * 14
    })
  })

  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={sun}
        castShadow={tier !== 'low'}
        shadow-mapSize={[settings.shadow, settings.shadow]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
      />
      <pointLight ref={fireLight} position={[ROOM.minX + 0.6, 0.8, -0.6]} color="#ff9a52" distance={6} decay={2} />
      {settings.washes &&
        [-3.2, 2.2, 3.9].map((z, i) => (
          <spotLight
            key={z}
            ref={(el) => {
              washes.current[i] = el
            }}
            position={[ROOM.minX + 0.35, ROOM.height - 0.15, z]}
            angle={0.6}
            penumbra={1}
            distance={5}
            decay={2}
            color="#ffd2a0"
          />
        ))}
      {/* Static studio-style reflections; brightness is scaled per mood via scene.environmentIntensity */}
      <Environment frames={1} resolution={128}>
        <Lightformer form="rect" intensity={3} color="#f2e6d6" position={[1, 1.8, -9]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffdcb0" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#a07a5a" position={[-7, 1.5, 0]} rotation-y={Math.PI / 2} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={0.35} color="#e8dfd0" position={[7, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[9, 3, 1]} />
      </Environment>
    </>
  )
}
