import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router'
import * as THREE from 'three'
import { play } from '../bencho/sounds/sounds'

const PHONE_GLB = '/models/vintage_telephone_toscano_pm1920.glb'

/** Second teapoy — Cylinder.001 in fitted loft. */
const TABLE = {
  x: 1.77,
  y: 0.31,
  z: 0.76,
}

const SPIN = 0.42
const TARGET_SPAN = 0.38
const HOVER_BASE = 0.14
const HOVER_AMP = 0.055

/**
 * Toscano vintage telephone on the lounge teapoy — floats and spins like the logo plaque.
 * Click → /contact.
 */
export function ContactPhone() {
  const group = useRef<THREE.Group>(null)
  const navigate = useNavigate()
  /* Loaded only when the loft Suspense mounts — no eager preload (~0.8 MB meshopt). */
  const { scene } = useGLTF(PHONE_GLB, false, true)

  const phone = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      const next = source.map((m) => {
        const mat = (m as THREE.Material).clone() as THREE.MeshStandardMaterial
        if ('map' in mat && mat.map) mat.map.colorSpace = THREE.SRGBColorSpace
        if ('envMapIntensity' in mat) mat.envMapIntensity = 1.15
        if ('roughness' in mat && typeof mat.roughness === 'number') {
          mat.roughness = Math.min(1, Math.max(0.25, mat.roughness * 0.92))
        }
        mat.needsUpdate = true
        return mat
      })
      mesh.material = next.length === 1 ? next[0] : next
    })

    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const span = Math.max(size.x, size.z, 1e-4)
    const s = TARGET_SPAN / span
    root.position.set(-center.x * s, -box.min.y * s, -center.z * s)
    root.scale.setScalar(s)
    return root
  }, [scene])

  const base = useMemo(
    () => ({ x: TABLE.x, y: TABLE.y + HOVER_BASE, z: TABLE.z }),
    [],
  )

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    play('nib')
    navigate('/contact')
  }

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime

    g.rotation.y += SPIN * dt
    g.position.x = base.x
    g.position.y = base.y + Math.sin(t * 1.05) * HOVER_AMP
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
      <primitive object={phone} />
    </group>
  )
}

