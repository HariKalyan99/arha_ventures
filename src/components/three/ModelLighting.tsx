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
  /** Site Night theme — cooler plate + specular punches for sheen */
  noir?: boolean
}

/**
 * Day: morning light through the loft window wall (Sketchfab panes on the left).
 * Night: quieter key, lamps carry the room.
 */
export function ModelLighting({ mood, blend, noir = false }: ModelLightingProps) {
  const { gl, scene } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const ambient = useRef<THREE.AmbientLight>(null)
  const windowKey = useRef<THREE.DirectionalLight>(null)
  const windowFill = useRef<THREE.DirectionalLight>(null)
  const windowSpot = useRef<THREE.SpotLight>(null)
  const windowSpotTarget = useRef<THREE.Object3D>(null)
  const lounge = useRef<THREE.PointLight>(null)
  const loungeSpot = useRef<THREE.SpotLight>(null)
  const loungeTarget = useRef<THREE.Object3D>(null)
  const artWall = useRef<THREE.PointLight>(null)
  const mezzanine = useRef<THREE.PointLight>(null)
  const stairRail = useRef<THREE.PointLight>(null)
  const underMezz = useRef<THREE.PointLight>(null)
  const ceiling = useRef<THREE.PointLight>(null)
  const sheenKey = useRef<THREE.DirectionalLight>(null)
  const current = useRef(cloneMood(moods[mood]))
  const target = useRef(cloneMood(moods[mood]))
  const morning = useRef(new THREE.Color('#ffe7c4'))
  const coolFill = useRef(new THREE.Color('#c4b8a8'))
  const noirRef = useRef(noir)
  noirRef.current = noir

  useLayoutEffect(() => {
    if (loungeSpot.current && loungeTarget.current) {
      loungeSpot.current.target = loungeTarget.current
    }
    if (windowSpot.current && windowSpotTarget.current) {
      windowSpot.current.target = windowSpotTarget.current
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
    /* How “morning” the plate still is as the tour eases toward evening. */
    const morningAmt = ink ? 0 : THREE.MathUtils.clamp(1 - lamp * 1.35, 0, 1)

    if (sun.current) {
      sun.current.color.copy(m.sunColor)
      sun.current.intensity = m.sunIntensity * (ink ? 0.75 : 0.68)
      sun.current.position.copy(m.sunPosition).multiplyScalar(1.05)
    }

    if (windowKey.current) {
      if (ink) {
        windowKey.current.color.copy(m.sunColor).lerp(coolFill.current, 0.5)
        windowKey.current.intensity = THREE.MathUtils.lerp(0.9, 0.45, lamp)
      } else {
        /* Through the left window wall — warm, but not hot enough to clip the leather. */
        windowKey.current.color.copy(m.sunColor).lerp(morning.current, 0.55)
        windowKey.current.intensity = THREE.MathUtils.lerp(1.55, 0.85, lamp) * (0.9 + morningAmt * 0.1)
      }
    }

    if (windowFill.current) {
      windowFill.current.visible = !ink
      windowFill.current.intensity = ink ? 0 : THREE.MathUtils.lerp(0.48, 0.22, lamp)
      windowFill.current.color.copy(morning.current)
    }

    if (windowSpot.current) {
      windowSpot.current.visible = !ink
      windowSpot.current.intensity = ink ? 0 : 2.6 * morningAmt
      windowSpot.current.color.copy(morning.current)
      windowSpot.current.target.updateMatrixWorld()
    }

    if (hemi.current) {
      hemi.current.color.copy(m.hemiSky)
      hemi.current.groundColor.copy(m.hemiGround)
      hemi.current.intensity = m.hemiIntensity * (ink ? 1.05 : 1.1)
    }
    if (ambient.current) {
      ambient.current.intensity = ink ? 0.22 : THREE.MathUtils.lerp(0.32, 0.24, lamp)
      ambient.current.color.set(ink ? '#1c222e' : '#efe4d4')
    }

    /* Day keeps lamps quiet so window light reads; night leans on them. */
    const lampBoost = ink ? 1.15 : 0.35 + lamp * 0.7
    if (lounge.current) lounge.current.intensity = (2.8 + lamp * 4.2) * lampBoost
    if (loungeSpot.current) {
      loungeSpot.current.intensity = (4.5 + lamp * 6.5) * lampBoost
      loungeSpot.current.target.updateMatrixWorld()
    }
    if (artWall.current) artWall.current.intensity = (2.2 + lamp * 3.8) * lampBoost
    if (mezzanine.current) mezzanine.current.intensity = (2.4 + lamp * 4.0) * lampBoost
    if (stairRail.current) stairRail.current.intensity = (0.9 + lamp * 1.6) * lampBoost
    if (underMezz.current) underMezz.current.intensity = (2.0 + lamp * 3.2) * lampBoost
    if (ceiling.current) ceiling.current.intensity = (0.85 + lamp * 1.3) * (ink ? 0.75 : 0.28 + lamp * 0.55)

    if (sheenKey.current) {
      /* Warm sheen — cool blue-gray was reading on leather inside. */
      sheenKey.current.intensity = ink ? 1.15 + lamp * 0.75 : 0
      sheenKey.current.color.set(ink ? '#e2d6c4' : '#000000')
    }

    scene.environmentIntensity = ink
      ? Math.max(0.55, m.envIntensity * 1.05)
      : Math.max(0.42, m.envIntensity * 0.88)
    gl.toneMappingExposure = m.exposure * (ink ? 1.05 : 0.94)
  })

  return (
    <>
      <hemisphereLight ref={hemi} intensity={0.9} />
      <ambientLight ref={ambient} intensity={0.35} color="#efe4d4" />

      <directionalLight ref={sun} castShadow={false} />

      {/* Window wall (Sketchfab left panes) — morning push into the loft */}
      <directionalLight ref={windowKey} position={[-7.5, 4.2, 1.2]} intensity={2.4} color="#ffe7c4" />
      <directionalLight ref={windowFill} position={[-6.2, 2.8, 3.4]} intensity={1.2} color="#ffe7c4" />
      <spotLight
        ref={windowSpot}
        position={[-6.8, 3.6, 1.6]}
        angle={0.55}
        penumbra={0.55}
        intensity={0}
        color="#ffe7c4"
        distance={18}
        decay={1.7}
        castShadow={false}
      />
      {/* Floor inside the panes — not the cushion faces. */}
      <object3D ref={windowSpotTarget} position={[-3.6, 0.2, 1.15]} />

      <directionalLight ref={sheenKey} position={[-4.5, 4.2, 5.5]} intensity={0} color="#e2d6c4" />

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

      {noir ? (
        <Environment frames={1} resolution={384} background={false} key="env-noir">
          <Lightformer form="rect" intensity={2.0} position={[0, 3, -9]} scale={[14, 5, 1]} color="#2a2420" />
          <Lightformer form="rect" intensity={2.2} position={[-6, 3.5, 3]} scale={[2.5, 9, 1]} color="#e0d4c4" />
          <Lightformer form="rect" intensity={1.2} position={[7, 2.8, 2]} scale={[2.5, 7, 1]} color="#a89888" />
          <Lightformer form="ring" intensity={0.9} position={[0, 7, 0]} scale={10} color="#c8bca8" />
          <Lightformer form="rect" intensity={0.3} position={[0, 1, 8]} scale={[12, 4, 1]} color="#1a1c24" />
        </Environment>
      ) : (
        <Environment frames={1} resolution={384} background={false} key="env-day">
          {/* Warm morning only — blue sky is a window billboard, not env. */}
          <Lightformer form="rect" intensity={2.15} position={[-8.5, 3.2, 1.5]} scale={[3.2, 9, 1]} color="#ffe8c8" />
          <Lightformer form="rect" intensity={1.15} position={[-7.5, 5.2, 2.2]} scale={[2.4, 3.5, 1]} color="#fff0d0" />
          <Lightformer form="rect" intensity={1.2} position={[0, 7, -3]} scale={[14, 4, 1]} color="#f0e6d8" />
          <Lightformer form="rect" intensity={0.85} position={[7, 2.4, 1]} scale={[3, 7, 1]} color="#c8b49a" />
          <Lightformer form="ring" intensity={0.55} position={[0, 7, 0]} scale={10} color="#efe6da" />
          <Lightformer form="rect" intensity={0.28} position={[0, 1, 8]} scale={[12, 4, 1]} color="#6a5648" />
        </Environment>
      )}
    </>
  )
}
