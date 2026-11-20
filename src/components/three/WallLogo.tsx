import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/** Texture path without cache-bust query — useTexture is happier with a clean URL. */
const LOGO_MAP = '/brand/arha-logo.png'

const SPIN_DEFAULT = 0.32
const SPIN_DRAG_GAIN = 6.5
const SPIN_FLING_MAX = 14
const SPIN_DAMP = 1.15
const LEAN_MAX = 0.38
const LEAN_SMOOTH = 7

/**
 * Brand plaque on the lounge teapoy — Bencho “coin” energy:
 * leans toward the pointer, drag to fling-spin, click for a brass ring pulse.
 */
export function WallLogo() {
  const group = useRef<THREE.Group>(null)
  const lean = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const spin = useRef(SPIN_DEFAULT)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const leanTarget = useRef({ x: 0, y: 0 })
  const leanNow = useRef({ x: 0, y: 0 })
  const pulse = useRef(0)
  const map = useTexture(LOGO_MAP)

  const logoMat = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    map.needsUpdate = true
    return new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      alphaTest: 0.2,
      depthWrite: false,
      side: THREE.FrontSide,
      toneMapped: false,
    })
  }, [map])

  const plateMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#e8e0d2',
        roughness: 0.42,
        metalness: 0.18,
        clearcoat: 0.55,
        clearcoatRoughness: 0.28,
        envMapIntensity: 0.55,
      }),
    [],
  )

  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b69b75',
        roughness: 0.35,
        metalness: 0.65,
        envMapIntensity: 0.7,
      }),
    [],
  )

  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#c9b28f',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  )

  const width = 0.42
  const height = width * (661 / 891)
  const plateW = width + 0.07
  const plateH = height + 0.07
  const depth = 0.026
  const base = useMemo(() => ({ x: -2.84, y: 0.82, z: 2.38 }), [])

  const firePulse = () => {
    pulse.current = 1
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    dragging.current = true
    lastX.current = e.clientX
    ;(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const g = group.current
    if (!g) return

    /* Magnetic lean toward the hit in local plaque space */
    const local = g.worldToLocal(e.point.clone())
    leanTarget.current.x = THREE.MathUtils.clamp((-local.y / (plateH * 0.5)) * LEAN_MAX, -LEAN_MAX, LEAN_MAX)
    leanTarget.current.y = THREE.MathUtils.clamp((local.x / (plateW * 0.5)) * LEAN_MAX, -LEAN_MAX, LEAN_MAX)

    if (dragging.current) {
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      spin.current = THREE.MathUtils.clamp(
        spin.current + dx * 0.02 * SPIN_DRAG_GAIN,
        -SPIN_FLING_MAX,
        SPIN_FLING_MAX,
      )
    }
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (dragging.current) {
      dragging.current = false
      /* Fling settle — if they barely moved, treat as a click pulse */
      if (Math.abs(spin.current) < 1.2) firePulse()
    }
  }

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    firePulse()
    /* Small spin kick if not already flinging hard */
    if (Math.abs(spin.current) < 2) spin.current += spin.current >= 0 ? 3.2 : -3.2
  }

  const onPointerOut = () => {
    dragging.current = false
    leanTarget.current.x = 0
    leanTarget.current.y = 0
    document.body.style.cursor = ''
  }

  useFrame((state, delta) => {
    const g = group.current
    const L = lean.current
    const R = ring.current
    if (!g || !L) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    /* Spin with drag inertia → ease back to a gentle idle turn */
    if (!dragging.current) {
      spin.current = THREE.MathUtils.damp(spin.current, SPIN_DEFAULT, SPIN_DAMP, dt)
    }
    g.rotation.y += spin.current * dt

    leanNow.current.x = THREE.MathUtils.damp(leanNow.current.x, leanTarget.current.x, LEAN_SMOOTH, dt)
    leanNow.current.y = THREE.MathUtils.damp(leanNow.current.y, leanTarget.current.y, LEAN_SMOOTH, dt)
    L.rotation.x = leanNow.current.x
    L.rotation.y = leanNow.current.y

    g.position.x = base.x
    g.position.y = base.y + Math.sin(t * 1.05) * 0.055
    g.position.z = base.z

    /* Brass ring pulse — expands and fades after click / soft fling */
    if (R && pulse.current > 0) {
      pulse.current = Math.max(0, pulse.current - dt * 1.35)
      const p = 1 - pulse.current
      const s = 1 + p * 1.85
      R.scale.setScalar(s)
      ringMat.opacity = pulse.current * 0.75
      R.visible = pulse.current > 0.02
    } else if (R) {
      R.visible = false
      ringMat.opacity = 0
    }

    /* Clearcoat breathes slightly when hovered (lean active) */
    const eng = Math.hypot(leanNow.current.x, leanNow.current.y) / LEAN_MAX
    plateMat.clearcoat = 0.55 + eng * 0.25
    plateMat.roughness = 0.42 - eng * 0.12
  })

  return (
    <group
      ref={group}
      position={[base.x, base.y, base.z]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerOut}
      onClick={onClick}
      onPointerOver={() => {
        document.body.style.cursor = 'grab'
      }}
      onPointerOut={onPointerOut}
    >
      <group ref={lean}>
        {/* Brass edge bevel */}
        <mesh material={rimMat} castShadow>
          <boxGeometry args={[plateW + 0.012, plateH + 0.012, depth * 0.72]} />
        </mesh>
        <mesh position={[0, 0, 0]} material={plateMat} castShadow receiveShadow>
          <boxGeometry args={[plateW, plateH, depth]} />
        </mesh>
        <mesh position={[0, 0, depth / 2 + 0.001]} material={logoMat}>
          <planeGeometry args={[width, height]} />
        </mesh>
        <mesh position={[0, 0, -(depth / 2 + 0.001)]} rotation={[0, Math.PI, 0]} material={logoMat}>
          <planeGeometry args={[width, height]} />
        </mesh>
        {/* Click pulse ring in the plaque plane */}
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} visible={false} material={ringMat}>
          <ringGeometry args={[Math.max(plateW, plateH) * 0.42, Math.max(plateW, plateH) * 0.5, 48]} />
        </mesh>
      </group>
    </group>
  )
}
