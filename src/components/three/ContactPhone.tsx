import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router'
import * as THREE from 'three'
import { play } from '../bencho/sounds/sounds'

const PHONE_GLB = '/models/vintage_telephone_toscano_pm1920.glb'

/** First lounge teapoy — same plan as the brand plaque (WallLogo). */
const TABLE = {
  x: -2.84,
  /** Authored table top at this xz (ray hit ≈ 0.367). */
  y: 0.39,
  z: 2.38,
}

/** Facing the room — no continuous spin. */
const YAW = 0.35
const TARGET_SPAN = 0.36

function makeBlobShadow(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.48)
  g.addColorStop(0, 'rgba(8,6,4,0.55)')
  g.addColorStop(0.45, 'rgba(8,6,4,0.22)')
  g.addColorStop(1, 'rgba(8,6,4,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  return map
}

/**
 * Toscano vintage telephone on the first lounge teapoy.
 * Sits on the table with a soft contact blob; rings instead of spinning. Click → /contact.
 */
export function ContactPhone() {
  const group = useRef<THREE.Group>(null)
  const navigate = useNavigate()
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

  const shadowMat = useMemo(() => {
    const map = makeBlobShadow()
    return new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  }, [])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    play('nib')
    navigate('/contact')
  }

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime

    /* Classic double-burst ring, then a pause. */
    const cycle = t % 2.6
    const ringing =
      (cycle > 0.05 && cycle < 0.22) || (cycle > 0.32 && cycle < 0.49)
    const amp = ringing ? Math.sin(t * 58) * 0.007 : 0

    g.position.x = TABLE.x + amp
    g.position.y = TABLE.y
    g.position.z = TABLE.z + amp * 0.55
    g.rotation.y = YAW
    g.rotation.z = amp * 3.2
    g.rotation.x = amp * 0.8
  })

  return (
    <>
      {/* Soft contact blob on the teapoy — hero has shadow maps off. */}
      <mesh
        position={[TABLE.x, TABLE.y + 0.002, TABLE.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={shadowMat}
        renderOrder={1}
      >
        <planeGeometry args={[0.42, 0.34]} />
      </mesh>
      <group
        ref={group}
        position={[TABLE.x, TABLE.y, TABLE.z]}
        rotation={[0, YAW, 0]}
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
    </>
  )
}
