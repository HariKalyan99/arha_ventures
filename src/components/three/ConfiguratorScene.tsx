import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import * as THREE from 'three'
import type { LightingMood, RoomFinishes, RoomView } from '../../data/configurator'
import type { QualityTier } from '../../lib/device'
import { RoomScene } from './RoomScene'
import { SceneCanvas } from './SceneCanvas'

/** Camera position and look-at target for each named view. */
const views: Record<RoomView, { position: [number, number, number]; target: [number, number, number] }> = {
  lounge: { position: [3.2, 1.75, 4.3], target: [-1.6, 0.85, -1.1] },
  hearth: { position: [1.7, 1.45, 1.6], target: [-5, 1.0, -0.6] },
  dining: { position: [0.1, 1.6, 1.9], target: [3.6, 0.85, -1.4] },
  terrace: { position: [-0.6, 1.5, 3.4], target: [1.6, 1.15, -8] },
}

interface ConfiguratorSceneProps {
  finishes: RoomFinishes
  mood: LightingMood
  view: RoomView
  /** Incremented to re-frame the current view (e.g. after the visitor has wandered off). */
  viewRequest: number
  tier: QualityTier
  active: boolean
  /** When false, pointer input is ignored so touch scrolling passes through the canvas. */
  interactive: boolean
  controlsRef: RefObject<CameraControlsImpl | null>
  onReady: () => void
}

function ViewController({ view, viewRequest, interactive, controlsRef }: Pick<ConfiguratorSceneProps, 'view' | 'viewRequest' | 'interactive' | 'controlsRef'>) {
  const local = useRef<CameraControlsImpl>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const first = useRef(true)

  useEffect(() => {
    camera.fov = size.width / size.height < 0.9 ? 62 : 44
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useLayoutEffect(() => {
    const controls = local.current
    if (!controls) return
    controlsRef.current = controls
    const ACTION = CameraControlsImpl.ACTION
    // Wheel is left to the page so the canvas never hijacks scrolling.
    controls.mouseButtons.wheel = ACTION.NONE
    controls.mouseButtons.left = ACTION.ROTATE
    controls.mouseButtons.right = ACTION.TRUCK
    controls.mouseButtons.middle = ACTION.DOLLY
    controls.touches.one = ACTION.TOUCH_ROTATE
    controls.touches.two = ACTION.TOUCH_DOLLY_TRUCK
    controls.touches.three = ACTION.NONE
    controls.minDistance = 0.8
    controls.maxDistance = 7
    controls.minPolarAngle = Math.PI * 0.3
    controls.maxPolarAngle = Math.PI * 0.56
    controls.smoothTime = 0.45
    controls.draggingSmoothTime = 0.18
    // Keep both the camera and its target inside the room shell.
    controls.boundaryEnclosesCamera = true
    controls.setBoundary(new THREE.Box3(new THREE.Vector3(-4.6, 0.35, -3.7), new THREE.Vector3(4.6, 3.0, 4.8)))
    return () => {
      controlsRef.current = null
    }
  }, [controlsRef])

  useEffect(() => {
    const controls = local.current
    if (!controls) return
    const { position: p, target: t } = views[view]
    controls.setLookAt(p[0], p[1], p[2], t[0], t[1], t[2], !first.current)
    first.current = false
  }, [view, viewRequest])

  useEffect(() => {
    if (local.current) local.current.enabled = interactive
  }, [interactive])

  return <CameraControls ref={local} makeDefault />
}

export default function ConfiguratorScene({ finishes, mood, view, viewRequest, tier, active, interactive, controlsRef, onReady }: ConfiguratorSceneProps) {
  return (
    <SceneCanvas tier={tier} active={active} onReady={onReady}>
      <ViewController view={view} viewRequest={viewRequest} interactive={interactive} controlsRef={controlsRef} />
      <RoomScene finishes={finishes} mood={mood} tier={tier} />
    </SceneCanvas>
  )
}
