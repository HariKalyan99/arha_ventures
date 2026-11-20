import { useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router'
import * as THREE from 'three'

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

/** “Call Us” label — eases down as the canvas narrows. 320→small · 768+→full */
function labelScale(width: number) {
  if (width >= 768) return { rem: 0.62, distanceFactor: 6.5, tracking: '0.04em' }
  if (width <= 320) return { rem: 0.4, distanceFactor: 10.5, tracking: '0.02em' }
  const t = (width - 320) / (768 - 320)
  const e = 1 - (1 - t) * (1 - t)
  return {
    rem: 0.4 + e * (0.62 - 0.4),
    distanceFactor: 10.5 - e * (10.5 - 6.5),
    tracking: `${0.02 + e * 0.02}em`,
  }
}

/**
 * Toscano vintage telephone on the lounge teapoy — floats and spins like the logo plaque.
 * Quiet label sits above the handset. Click → /contact.
 */
export function ContactPhone() {
  const group = useRef<THREE.Group>(null)
  const navigate = useNavigate()
  const { scene } = useGLTF(PHONE_GLB)
  const width = useThree((s) => s.size.width)
  const label = useMemo(() => labelScale(width), [width])

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
    return { root, height: size.y * s }
  }, [scene])

  const base = useMemo(
    () => ({ x: TABLE.x, y: TABLE.y + HOVER_BASE, z: TABLE.z }),
    [],
  )

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
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
      <primitive object={phone.root} />

      {/* Billboard so the label stays readable while the phone spins */}
      <Html
        position={[0, phone.height + 0.06, 0]}
        center
        sprite
        distanceFactor={label.distanceFactor}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <p
          className="whitespace-nowrap font-medium text-parchment/85 normal-case"
          style={{
            fontSize: `${label.rem}rem`,
            letterSpacing: label.tracking,
          }}
        >
          Call Us
        </p>
      </Html>
    </group>
  )
}

useGLTF.preload(PHONE_GLB)
