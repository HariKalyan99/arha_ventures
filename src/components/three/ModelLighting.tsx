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
  /** Site Night theme — warm shadow plate + specular punches for sheen */
  noir?: boolean
}

/**
 * Sraven interior — even ambient plate with soft key from the stair / volume end,
 * lamps filling pooja, kitchen and the long axis.
 */
export function ModelLighting({ mood, blend, noir = false }: ModelLightingProps) {
  const { gl, scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const ambient = useRef<THREE.AmbientLight>(null)
  const volumeKey = useRef<THREE.DirectionalLight>(null)
  const volumeFill = useRef<THREE.DirectionalLight>(null)
  const lounge = useRef<THREE.PointLight>(null)
  const loungeSpot = useRef<THREE.SpotLight>(null)
  const loungeTarget = useRef<THREE.Object3D>(null)
  const pooja = useRef<THREE.PointLight>(null)
  const kitchen = useRef<THREE.PointLight>(null)
  const stairRail = useRef<THREE.PointLight>(null)
  const ceiling = useRef<THREE.PointLight>(null)
  const sheenKey = useRef<THREE.DirectionalLight>(null)
  const current = useRef(cloneMood(moods[mood]))
  const target = useRef(cloneMood(moods[mood]))
  const morning = useRef(new THREE.Color('#ffe7c4'))
  const coolFill = useRef(new THREE.Color('#c4b8a8'))
  const warmShadow = useRef(new THREE.Color('#2a241c'))
  const noirRef = useRef(noir)
  noirRef.current = noir

  useLayoutEffect(() => {
    if (loungeSpot.current && loungeTarget.current) {
      loungeSpot.current.target = loungeTarget.current
    }
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const ink = noirRef.current
    if (blend) {
      mixMood(moods[blend.from], moods[blend.to], THREE.MathUtils.clamp(blend.progress.current ?? 0, 0, 1), target.current)
    } else {
      mixMood(moods[mood], moods[mood], 0, target.current)
    }
    dampMood(current.current, target.current, blend ? 6 : 2.4, dt)
    const m = current.current
    const lamp = m.lamp
    const morningAmt = ink ? 0 : THREE.MathUtils.clamp(1 - lamp * 1.35, 0, 1)

    if (sun.current) {
      sun.current.color.copy(m.sunColor)
      sun.current.intensity = m.sunIntensity * (ink ? 0.7 : 0.62)
      sun.current.position.copy(m.sunPosition).multiplyScalar(1.05)
    }

    if (volumeKey.current) {
      if (ink) {
        volumeKey.current.color.copy(coolFill.current)
        volumeKey.current.intensity = THREE.MathUtils.lerp(0.85, 0.4, lamp)
      } else {
        volumeKey.current.color.copy(m.sunColor).lerp(morning.current, 0.5)
        volumeKey.current.intensity = THREE.MathUtils.lerp(1.35, 0.75, lamp) * (0.9 + morningAmt * 0.1)
      }
    }

    if (volumeFill.current) {
      volumeFill.current.visible = !ink
      volumeFill.current.intensity = ink ? 0 : THREE.MathUtils.lerp(0.42, 0.2, lamp)
      volumeFill.current.color.copy(morning.current)
    }

    if (hemi.current) {
      hemi.current.color.copy(ink ? warmShadow.current : m.hemiSky)
      hemi.current.groundColor.copy(m.hemiGround)
      hemi.current.intensity = m.hemiIntensity * (ink ? 1.05 : 1.15)
    }
    if (ambient.current) {
      ambient.current.intensity = ink ? 0.28 : THREE.MathUtils.lerp(0.4, 0.3, lamp)
      ambient.current.color.set(ink ? '#1a1612' : '#efe4d4')
    }

    const lampBoost = ink ? 1.15 : 0.4 + lamp * 0.7
    if (lounge.current) lounge.current.intensity = (2.4 + lamp * 3.6) * lampBoost
    if (loungeSpot.current) {
      loungeSpot.current.intensity = (3.8 + lamp * 5.5) * lampBoost
      loungeSpot.current.target.updateMatrixWorld()
    }
    if (pooja.current) pooja.current.intensity = (2.4 + lamp * 3.6) * lampBoost
    if (kitchen.current) kitchen.current.intensity = (2.6 + lamp * 4.0) * lampBoost
    if (stairRail.current) stairRail.current.intensity = (1.4 + lamp * 2.2) * lampBoost
    if (ceiling.current) ceiling.current.intensity = (1.1 + lamp * 1.5) * (ink ? 0.8 : 0.35 + lamp * 0.55)

    if (sheenKey.current) {
      sheenKey.current.intensity = ink ? 1.05 + lamp * 0.7 : 0
      sheenKey.current.color.set(ink ? '#e2d6c4' : '#000000')
    }

    scene.environmentIntensity = ink
      ? Math.max(0.55, m.envIntensity * 1.05)
      : Math.max(0.48, m.envIntensity * 0.92)
    gl.toneMappingExposure = m.exposure * (ink ? 1.05 : 0.96)
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={0.95} />
      <ambientLight ref={ambient} intensity={0.4} color="#efe4d4" />

      <directionalLight ref={sun} castShadow={false} />

      {/* Soft key from the stair / open volume (+Z) */}
      <directionalLight ref={volumeKey} position={[1.5, 4.5, 8]} intensity={1.4} color="#ffe7c4" />
      <directionalLight ref={volumeFill} position={[-4, 3.2, 2]} intensity={0.5} color="#ffe7c4" />

      <directionalLight ref={sheenKey} position={[3, 4, -6]} intensity={0} color="#e2d6c4" />

      <pointLight ref={lounge} position={[0.2, 2.4, -1.5]} color="#ffc089" distance={14} decay={2} />
      <spotLight
        ref={loungeSpot}
        position={[0.5, 3.2, -3.5]}
        angle={0.55}
        penumbra={0.88}
        color="#ffd2a4"
        distance={16}
        decay={2}
        castShadow={false}
      />
      <object3D ref={loungeTarget} position={[0.2, 1.1, 1.5]} />

      <pointLight ref={pooja} position={[-0.2, 2.3, 2.8]} color="#f0d2a8" distance={11} decay={2} />
      <pointLight ref={kitchen} position={[2.2, 2.2, -7.5]} color="#e8c9a0" distance={12} decay={2} />
      <pointLight ref={stairRail} position={[-1.4, 2.6, 6.2]} color="#e6d2b4" distance={9} decay={2.2} />
      <pointLight ref={ceiling} position={[0.4, 3.2, -1]} color="#e8d4b8" distance={18} decay={2.2} />

      {noir ? (
        <Environment frames={1} resolution={384} background={false} key="env-noir">
          <Lightformer form="rect" intensity={2.0} position={[0, 3, 9]} scale={[14, 5, 1]} color="#2a2420" />
          <Lightformer form="rect" intensity={2.0} position={[-6, 3.5, 0]} scale={[2.5, 9, 1]} color="#e0d4c4" />
          <Lightformer form="rect" intensity={1.2} position={[7, 2.8, -2]} scale={[2.5, 7, 1]} color="#a89888" />
          <Lightformer form="ring" intensity={0.9} position={[0, 7, 0]} scale={12} color="#c8bca8" />
          <Lightformer form="rect" intensity={0.3} position={[0, 1, -9]} scale={[12, 4, 1]} color="#1a1612" />
        </Environment>
      ) : (
        <Environment frames={1} resolution={384} background={false} key="env-day">
          <Lightformer form="rect" intensity={2.0} position={[2, 3.5, 9]} scale={[4, 8, 1]} color="#ffe8c8" />
          <Lightformer form="rect" intensity={1.1} position={[-6, 4.5, 2]} scale={[2.4, 5, 1]} color="#fff0d0" />
          <Lightformer form="rect" intensity={1.2} position={[0, 7, -2]} scale={[16, 4, 1]} color="#f0e6d8" />
          <Lightformer form="rect" intensity={0.9} position={[6, 2.4, -4]} scale={[3, 7, 1]} color="#c8b49a" />
          <Lightformer form="ring" intensity={0.6} position={[0, 7, 0]} scale={12} color="#efe6da" />
          <Lightformer form="rect" intensity={0.3} position={[0, 1, -10]} scale={[14, 4, 1]} color="#6a5648" />
        </Environment>
      )}
    </>
  )
}
