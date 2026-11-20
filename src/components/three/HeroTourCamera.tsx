import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  houseTourStops,
  mapTourScrollProgress,
  TOUR_CAMERA_BOUNDS,
  TOUR_MOBILE_MAX_WIDTH,
  tourPoseFor,
} from './tourStops'

interface HeroTourCameraProps {
  progress: RefObject<number>
  reducedMotion: boolean
}

/**
 * Scroll drives the camera 1:1 through stations (linear blend — no ease that
 * decelerates at every stop). Mouse only adds a light look offset on desktop.
 */
export function HeroTourCamera({ progress, reducedMotion }: HeroTourCameraProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)
  const pointer = useRef({ x: 0, y: 0, armed: false })
  const smooth = useRef({ x: 0, y: 0, fov: houseTourStops[0].fov })
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const fromPos = useMemo(() => new THREE.Vector3(), [])
  const toPos = useMemo(() => new THREE.Vector3(), [])
  const fromLook = useMemo(() => new THREE.Vector3(), [])
  const toLook = useMemo(() => new THREE.Vector3(), [])
  const offset = useMemo(() => new THREE.Vector3(), [])
  const forward = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const worldUp = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const bounds = useMemo(
    () =>
      new THREE.Box3(
        new THREE.Vector3(...TOUR_CAMERA_BOUNDS.min),
        new THREE.Vector3(...TOUR_CAMERA_BOUNDS.max),
      ),
    [],
  )

  const mobile = size.width <= TOUR_MOBILE_MAX_WIDTH
  const portrait = size.width / size.height < 0.9

  const stations = useMemo(
    () =>
      houseTourStops.map((s) => {
        const pose = tourPoseFor(s, mobile, size.width)
        return {
          pos: new THREE.Vector3(...pose.position),
          look: new THREE.Vector3(...pose.target),
          fov: pose.fov,
        }
      }),
    [mobile, size.width],
  )

  useEffect(() => {
    camera.up.copy(worldUp)
  }, [camera, worldUp])

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const rect = gl.domElement.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      if (!inside) {
        pointer.current.x *= 0.92
        pointer.current.y *= 0.92
        return
      }
      if (!pointer.current.armed) {
        pointer.current.armed = true
        pointer.current.x = 0
        pointer.current.y = 0
        return
      }
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      pointer.current.x = THREE.MathUtils.clamp(nx, -1, 1)
      pointer.current.y = THREE.MathUtils.clamp(ny, -1, 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [gl, reducedMotion])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const k = 1 - Math.exp(-dt * 2.8)
    const s = smooth.current
    s.x += (pointer.current.x - s.x) * k
    s.y += (pointer.current.y - s.y) * k

    /* Lock to scroll progress — a second lerp here stacked on Lenis and felt stuck. */
    const t = THREE.MathUtils.clamp(reducedMotion ? 0 : mapTourScrollProgress(progress.current ?? 0), 0, 1)
    const n = stations.length
    const scaled = t * (n - 1)
    const i = Math.min(n - 2, Math.floor(scaled))
    /* Linear blend between stations — smoothstep paused at every stop boundary. */
    const e = scaled - i

    fromPos.copy(stations[i].pos)
    toPos.copy(stations[i + 1].pos)
    fromLook.copy(stations[i].look)
    toLook.copy(stations[i + 1].look)
    pos.lerpVectors(fromPos, toPos, e)
    look.lerpVectors(fromLook, toLook, e)

    const portraitBoost = portrait ? (mobile ? 2 : 8) : 0
    const desiredFov = THREE.MathUtils.lerp(stations[i].fov, stations[i + 1].fov, e) + portraitBoost
    s.fov += (desiredFov - s.fov) * (1 - Math.exp(-dt * 5))
    if (Math.abs(camera.fov - s.fov) > 0.04) {
      camera.fov = s.fov
      camera.updateProjectionMatrix()
    }

    forward.subVectors(look, pos)
    forward.y = 0
    if (forward.lengthSq() < 1e-4) forward.set(0, 0, -1)
    else forward.normalize()
    right.crossVectors(forward, worldUp).normalize()

    const lookYaw = mobile ? 0.45 : 1.0
    const lookPitch = mobile ? 0.18 : 0.4
    const walkSide = mobile ? 0.14 : 0.32
    const walkFwd = mobile ? 0.08 : 0.18
    const walkUp = mobile ? 0.05 : 0.1

    offset
      .set(0, 0, 0)
      .addScaledVector(right, s.x * walkSide)
      .addScaledVector(forward, -s.y * walkFwd)
      .addScaledVector(worldUp, -s.y * walkUp)

    camera.position.copy(pos).add(offset)
    bounds.clampPoint(camera.position, camera.position)

    look.addScaledVector(right, s.x * lookYaw)
    look.y += -s.y * lookPitch

    camera.up.copy(worldUp)
    camera.lookAt(look)
  })

  return null
}
