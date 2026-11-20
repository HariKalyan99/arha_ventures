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
 * Soft daylight interior for the loft GLB.
 * Broad fill + gentle window wash — no hard keys, no lamp hotspots.
 */
export function ModelLighting({ mood, blend }: ModelLightingProps) {
  const { gl, scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const windowKey = useRef<THREE.DirectionalLight>(null)
  const current = useRef(cloneMood(moods[mood]))
  const target = useRef(cloneMood(moods[mood]))
  const warmFill = useRef(new THREE.Color('#f2e6d4'))

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
      /* Soft key — enough form, not a spotlight punch */
      sun.current.intensity = m.sunIntensity * 0.75
      sun.current.position.copy(m.sunPosition).multiplyScalar(1.05)
    }
    if (windowKey.current) {
      windowKey.current.color.copy(m.sunColor).lerp(warmFill.current, 0.4)
      windowKey.current.intensity = THREE.MathUtils.lerp(1.35, 0.7, m.lamp)
    }
    if (hemi.current) {
      hemi.current.color.copy(m.hemiSky)
      hemi.current.groundColor.copy(m.hemiGround)
      hemi.current.intensity = m.hemiIntensity * 1.05
    }

    scene.environmentIntensity = Math.max(0.7, m.envIntensity * 1.1)
    gl.toneMappingExposure = m.exposure
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={0.9} />
      <ambientLight intensity={0.55} color="#efe6d8" />

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

      {/* Soft exterior wash through the openings — even, not a beam */}
      <directionalLight ref={windowKey} position={[1.2, 4.2, -5.5]} intensity={1.2} color="#f0e4d0" />

      {/* Quiet bounce only — no focused practical hotspots */}
      <pointLight position={[-1.8, 2.4, 1.2]} color="#f0e0c8" intensity={0.55} distance={14} decay={2} />
      <pointLight position={[2.2, 2.2, -0.8]} color="#ebe0d0" intensity={0.45} distance={12} decay={2} />

      <Environment frames={1} resolution={256}>
        <Lightformer form="rect" intensity={4.2} position={[0, 4, -9]} scale={[16, 6, 1]} color="#f5ebe0" />
        <Lightformer form="rect" intensity={1.8} position={[-7, 3, 2]} scale={[3.5, 9, 1]} color="#d8c8b0" />
        <Lightformer form="rect" intensity={1.4} position={[7, 2.5, 1]} scale={[3.5, 8, 1]} color="#e8dcc8" />
        <Lightformer form="ring" intensity={1.1} position={[0, 8, 0]} scale={12} color="#faf7f2" />
        <Lightformer form="rect" intensity={0.55} position={[0, 1, 8]} scale={[14, 5, 1]} color="#c4b49e" />
      </Environment>
    </>
  )
}
