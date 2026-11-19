import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import type { LightingMood } from '../../data/configurator'
import { cloneMood, dampMood, mixMood, moods } from './moods'
import type { MoodBlend } from './Lighting'

interface ModelLightingProps {
  mood: LightingMood
  blend?: MoodBlend
}

/**
 * Natural warm interior lighting for the loft GLB.
 * Soft window wash + gentle practicals — no hard keys, no blown whites.
 */
export function ModelLighting({ mood, blend }: ModelLightingProps) {
  const { gl, scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const windowKey = useRef<THREE.DirectionalLight>(null)
  const lampA = useRef<THREE.PointLight>(null)
  const lampB = useRef<THREE.PointLight>(null)
  const lampC = useRef<THREE.PointLight>(null)
  const current = useRef(cloneMood(moods[mood]))
  const target = useRef(cloneMood(moods[mood]))
  const warmFill = useRef(new THREE.Color('#f0e0c8'))

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    if (blend) {
      mixMood(moods[blend.from], moods[blend.to], THREE.MathUtils.clamp(blend.progress.current ?? 0, 0, 1), target.current)
    } else {
      mixMood(moods[mood], moods[mood], 0, target.current)
    }
    dampMood(current.current, target.current, blend ? 6 : 2.4, dt)
    const m = current.current

    if (sun.current) {
      sun.current.color.copy(m.sunColor)
      sun.current.intensity = m.sunIntensity * 0.92
      sun.current.position.copy(m.sunPosition).multiplyScalar(1.1)
    }
    if (windowKey.current) {
      windowKey.current.color.copy(m.sunColor).lerp(warmFill.current, 0.55)
      windowKey.current.intensity = THREE.MathUtils.lerp(2.2, 0.55, m.lamp)
    }
    if (hemi.current) {
      hemi.current.color.copy(m.hemiSky)
      hemi.current.groundColor.copy(m.hemiGround)
      hemi.current.intensity = m.hemiIntensity * 1.15
    }
    if (lampA.current) lampA.current.intensity = 0.35 + m.lamp * 3.2
    if (lampB.current) lampB.current.intensity = 0.28 + m.lamp * 2.6
    if (lampC.current) lampC.current.intensity = 0.24 + m.lamp * 2.8

    scene.environmentIntensity = Math.max(0.45, m.envIntensity * 1.25)
    gl.toneMappingExposure = m.exposure * 1.08
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={0.6} />
      <ambientLight intensity={0.28} color="#e0d0bc" />

      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
      />

      {/* Soft exterior wash through the openings */}
      <directionalLight ref={windowKey} position={[1.4, 3.6, -6]} intensity={1.8} color="#e8d2b0" />

      {/* Warm practicals — gentle pools, natural falloff */}
      <pointLight ref={lampA} position={[-2.2, 2.1, 1.4]} color="#ffc089" distance={11} decay={2} />
      <pointLight ref={lampB} position={[2.6, 1.4, -1.2]} color="#ffb36b" distance={9} decay={2} />
      <pointLight ref={lampC} position={[0.4, 3.4, 0.6]} color="#e8c9a0" distance={12} decay={2} />
      <pointLight position={[1.2, 1.9, 2.4]} color="#f0d2a8" intensity={1.15} distance={8} decay={2} />

      <Environment frames={1} resolution={256}>
        <Lightformer form="rect" intensity={3.4} position={[0, 3, -9]} scale={[14, 5, 1]} color="#f0e4d2" />
        <Lightformer form="rect" intensity={1.5} position={[-7, 2.5, 2]} scale={[3, 8, 1]} color="#b69b75" />
        <Lightformer form="rect" intensity={0.95} position={[7, 2, 1]} scale={[3, 7, 1]} color="#d4c0a8" />
        <Lightformer form="ring" intensity={0.6} position={[0, 7, 0]} scale={10} color="#e8e0d2" />
        <Lightformer form="rect" intensity={0.4} position={[0, 1, 8]} scale={[12, 4, 1]} color="#604a3b" />
      </Environment>
    </>
  )
}
