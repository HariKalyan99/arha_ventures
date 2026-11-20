import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { defaultFinishes } from '../../data/configurator'
import type { QualityTier } from '../../lib/device'
import { HeroTourCamera } from './HeroTourCamera'
import { RoomScene } from './RoomScene'
import { HERO_ROOM_SOURCE } from './roomSource'
import { SceneCanvas } from './SceneCanvas'

interface HeroSceneProps {
  /** Scroll progress through the hero, 0–1 */
  progress: RefObject<number>
  active: boolean
  reducedMotion: boolean
  tier: QualityTier
  onReady: () => void
}

/** Camera framing for the procedural room (fireplace left, glazing ahead). */
const proceduralPose = {
  landscape: { position: new THREE.Vector3(2.6, 1.45, 4.7), target: new THREE.Vector3(-0.2, 1.08, -3.2), fov: 42 },
  portrait: { position: new THREE.Vector3(1.6, 1.4, 4.75), target: new THREE.Vector3(-0.6, 1.05, -3), fov: 64 },
}

/**
 * Procedural-room camera: ambient drift, pointer parallax, scroll dolly.
 * Kept for when HERO_ROOM_SOURCE is flipped back to `'procedural'`.
 */
function ProceduralHeroCamera({ progress, reducedMotion }: { progress: RefObject<number>; reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const pointer = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0, p: 0 })
  const look = useMemo(() => new THREE.Vector3(), [])
  const portrait = size.width / size.height < 0.9
  const base = portrait ? proceduralPose.portrait : proceduralPose.landscape

  useEffect(() => {
    camera.fov = base.fov
    camera.updateProjectionMatrix()
  }, [camera, base.fov])

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reducedMotion])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const k = 1 - Math.exp(-dt * 2.4)
    const s = smooth.current
    s.x += (pointer.current.x - s.x) * k
    s.y += (pointer.current.y - s.y) * k
    s.p += ((reducedMotion ? 0 : (progress.current ?? 0)) - s.p) * (1 - Math.exp(-dt * 6))

    const t = state.clock.elapsedTime
    const drift = reducedMotion ? 0 : Math.sin(t * 0.13) * 0.12
    const ease = s.p * s.p * (3 - 2 * s.p)

    camera.position.set(
      base.position.x + s.x * 0.42 + drift - ease * 1.1,
      base.position.y - s.y * 0.14 - ease * 0.12,
      base.position.z - ease * 2.4,
    )
    look.set(base.target.x + s.x * 0.25, base.target.y - s.y * 0.08 - ease * 0.05, base.target.z + drift * 0.5)
    camera.lookAt(look)
  })

  return null
}

export default function HeroScene({ progress, active, reducedMotion, tier, onReady }: HeroSceneProps) {
  /* Soft daylight → gentle late afternoon — no night crush for the light site theme */
  const blend = useMemo(() => ({ from: 'daylight' as const, to: 'evening' as const, progress }), [progress])
  return (
    <SceneCanvas tier={tier} active={active} onReady={onReady} className="!absolute inset-0">
      {HERO_ROOM_SOURCE === 'glb' ? (
        <HeroTourCamera progress={progress} reducedMotion={reducedMotion} />
      ) : (
        <ProceduralHeroCamera progress={progress} reducedMotion={reducedMotion} />
      )}
      <RoomScene finishes={defaultFinishes} mood="daylight" blend={blend} tier={tier} source={HERO_ROOM_SOURCE} />
    </SceneCanvas>
  )
}
