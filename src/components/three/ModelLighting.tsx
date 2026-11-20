import { useLayoutEffect, useRef } from 'react'
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
 * Standard balanced loft plate — warm sheen kept, soft punches on sofa/art/
 * mezzanine, ceiling quiet so pale floors don’t flood white.
 */
export function ModelLighting({ mood, blend }: ModelLightingProps) {
  const { gl, scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const windowKey = useRef<THREE.DirectionalLight>(null)
  const lounge = useRef<THREE.PointLight>(null)
  const loungeSpot = useRef<THREE.SpotLight>(null)
  const loungeTarget = useRef<THREE.Object3D>(null)
  const artWall = useRef<THREE.PointLight>(null)
  const mezzanine = useRef<THREE.PointLight>(null)
  const stairRail = useRef<THREE.PointLight>(null)
  const underMezz = useRef<THREE.PointLight>(null)
  const ceiling = useRef<THREE.PointLight>(null)
  const current = useRef(cloneMood(moods[mood]))
  const target = useRef(cloneMood(moods[mood]))
  const warmFill = useRef(new THREE.Color('#f0e0c8'))

  useLayoutEffect(() => {
    if (loungeSpot.current && loungeTarget.current) {
      loungeSpot.current.target = loungeTarget.current
    }
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    if (blend) {
      mixMood(moods[blend.from], moods[blend.to], THREE.MathUtils.clamp(blend.progress.current ?? 0, 0, 1), target.current)
    } else {
      mixMood(moods[mood], moods[mood], 0, target.current)
    }
    dampMood(current.current, target.current, blend ? 6 : 2.4, dt)
    const m = current.current
    const lamp = m.lamp

    if (sun.current) {
      sun.current.color.copy(m.sunColor)
      sun.current.intensity = m.sunIntensity * 0.9
      sun.current.position.copy(m.sunPosition).multiplyScalar(1.1)
    }
    if (windowKey.current) {
      windowKey.current.color.copy(m.sunColor).lerp(warmFill.current, 0.45)
      windowKey.current.intensity = THREE.MathUtils.lerp(2.0, 0.75, lamp)
    }
    if (hemi.current) {
      hemi.current.color.copy(m.hemiSky)
      hemi.current.groundColor.copy(m.hemiGround)
      hemi.current.intensity = m.hemiIntensity * 1.25
    }

    if (lounge.current) lounge.current.intensity = 2.8 + lamp * 4.2
    if (loungeSpot.current) {
      loungeSpot.current.intensity = 4.5 + lamp * 6.5
      loungeSpot.current.target.updateMatrixWorld()
    }
    if (artWall.current) artWall.current.intensity = 2.2 + lamp * 3.8
    if (mezzanine.current) mezzanine.current.intensity = 2.4 + lamp * 4.0
    if (stairRail.current) stairRail.current.intensity = 0.9 + lamp * 1.6
    if (underMezz.current) underMezz.current.intensity = 2.0 + lamp * 3.2
    if (ceiling.current) ceiling.current.intensity = 0.85 + lamp * 1.3

    scene.environmentIntensity = Math.max(0.62, m.envIntensity * 1.25)
    gl.toneMappingExposure = m.exposure * 1.12
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={0.9} />
      <ambientLight intensity={0.4} color="#e2d4c2" />

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

      <directionalLight ref={windowKey} position={[1.4, 3.6, -6]} intensity={1.7} color="#e8d2b0" />

      <pointLight ref={lounge} position={[-2.25, 2.2, 1.9]} color="#ffc089" distance={11} decay={2} />
      <spotLight
        ref={loungeSpot}
        position={[-0.45, 3.15, 3.4]}
        angle={0.5}
        penumbra={0.88}
        color="#ffd2a4"
        distance={13}
        decay={2}
        castShadow={false}
      />
      <object3D ref={loungeTarget} position={[-2.85, 1.1, 1.45]} />

      <pointLight ref={artWall} position={[0.2, 2.2, 2.4]} color="#f0d2a8" distance={9} decay={2} />
      <pointLight ref={mezzanine} position={[2.8, 1.9, 0.25]} color="#e8c9a0" distance={9} decay={2} />
      <pointLight ref={underMezz} position={[-1.0, 2.4, 0.5]} color="#e8c9a0" distance={8} decay={2} />
      <pointLight ref={stairRail} position={[3.5, 2.9, 0.8]} color="#e6d2b4" distance={7} decay={2.2} />
      <pointLight ref={ceiling} position={[0.1, 3.7, 0.5]} color="#e8d4b8" distance={14} decay={2.3} />

      <Environment frames={1} resolution={256}>
        <Lightformer form="rect" intensity={3.6} position={[0, 3, -9]} scale={[14, 5, 1]} color="#f0e4d2" />
        <Lightformer form="rect" intensity={1.5} position={[-7, 2.5, 2]} scale={[3, 8, 1]} color="#b69b75" />
        <Lightformer form="rect" intensity={0.9} position={[7, 2.2, 1]} scale={[3, 7, 1]} color="#d4c0a8" />
        <Lightformer form="ring" intensity={0.75} position={[0, 7, 0]} scale={10} color="#e8e0d2" />
        <Lightformer form="rect" intensity={0.45} position={[0, 1, 8]} scale={[12, 4, 1]} color="#604a3b" />
      </Environment>
    </>
  )
}
