import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/** Texture path without cache-bust query — useTexture is happier with a clean URL. */
const LOGO_MAP = '/brand/arha-logo.png'

const SPIN_DEFAULT = 0.38
const SPIN_BOOST = 4.2
/** Higher = returns to default faster once the burst is done */
const SPIN_SETTLE = 1.4
/** Full turns played at boost speed on each click */
const SPIN_ROUNDS = 2
const SPIN_BURST = Math.PI * 2 * SPIN_ROUNDS

/**
 * Brand plaque hovering on the round coffee table (teapoy) in the sofa group.
 * Table mesh in fitted loft: Cylinder ≈ (-2.84, 0.24, 2.38), top y ≈ 0.37.
 * Spins on Y, bobs like a blimp; click boosts spin, then eases back.
 */
export function WallLogo() {
  const group = useRef<THREE.Group>(null)
  const spin = useRef(SPIN_DEFAULT)
  /** Radians still to deliver at boost speed (2 turns per click). */
  const burstLeft = useRef(0)
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
      new THREE.MeshStandardMaterial({
        color: '#e8e0d2',
        roughness: 0.88,
        metalness: 0,
        envMapIntensity: 0.22,
      }),
    [],
  )

  const width = 0.42
  const height = width * (661 / 891)
  const plateW = width + 0.07
  const plateH = height + 0.07
  const depth = 0.026

  // Dead-center on the teapoy
  const base = useMemo(() => ({ x: -2.84, y: 0.82, z: 2.38 }), [])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    burstLeft.current += SPIN_BURST
    spin.current = SPIN_BOOST
  }

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    if (burstLeft.current > 0) {
      const step = Math.min(SPIN_BOOST * dt, burstLeft.current)
      g.rotation.y += step
      burstLeft.current -= step
      spin.current = SPIN_BOOST
    } else {
      spin.current = THREE.MathUtils.damp(spin.current, SPIN_DEFAULT, SPIN_SETTLE, dt)
      g.rotation.y += spin.current * dt
    }

    g.position.x = base.x
    g.position.y = base.y + Math.sin(t * 1.05) * 0.06
    g.position.z = base.z
  })

  return (
    <group
      ref={group}
      position={[base.x, base.y, base.z]}
      onClick={onClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      <mesh position={[0, 0, 0]} material={plateMat} castShadow receiveShadow>
        <boxGeometry args={[plateW, plateH, depth]} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.001]} material={logoMat}>
        <planeGeometry args={[width, height]} />
      </mesh>
      <mesh position={[0, 0, -(depth / 2 + 0.001)]} rotation={[0, Math.PI, 0]} material={logoMat}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  )
}
