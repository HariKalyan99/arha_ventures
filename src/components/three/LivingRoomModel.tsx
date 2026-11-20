import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { LIVING_ROOM_GLB, LIVING_ROOM_TARGET_SPAN, LIVING_ROOM_YAW } from './roomSource'
import { ContactPhone } from './ContactPhone'
import { WallLogo } from './WallLogo'

/** Materials used by the free_loft city towers / exterior blocks — kept out of the hero. */
const EXTERIOR_MATERIALS = new Set([
  'Material.023',
  'Material.024',
  'Material.025',
  'Material.026',
  'Material.027',
  'Material.028',
  'Material.029',
  'Material.030',
  'Material.031',
])

function isExteriorMesh(mesh: THREE.Mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  if (mats.some((m) => m && EXTERIOR_MATERIALS.has(m.name))) return true
  if (/^Plane007_/.test(mesh.name)) return true
  return false
}

/** Bounds from visible meshes only (skips hidden city geometry). */
function interiorBox(root: THREE.Object3D) {
  const box = new THREE.Box3()
  const temp = new THREE.Box3()
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.visible) return
    const geom = obj.geometry
    if (!geom.boundingBox) geom.computeBoundingBox()
    if (!geom.boundingBox) return
    temp.copy(geom.boundingBox).applyMatrix4(obj.matrixWorld)
    box.union(temp)
  })
  return box
}

/** Opaque shell so cutaway openings never reveal the void — soft daylight beyond the glass. */
function InteriorEnclosure() {
  return (
    <group>
      {/* Inverted box — only the inner faces render */}
      <mesh receiveShadow={false} castShadow={false}>
        <boxGeometry args={[28, 14, 28]} />
        <meshStandardMaterial
          color="#e8e0d2"
          roughness={1}
          metalness={0}
          side={THREE.BackSide}
          envMapIntensity={0.2}
        />
      </mesh>
      {/* Soft daylight beyond the openings */}
      <mesh position={[0, 3.2, -8.5]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#d4c8b8" toneMapped={false} />
      </mesh>
      <mesh position={[-8.5, 3.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[18, 10]} />
        <meshBasicMaterial color="#cfc3b2" toneMapped={false} />
      </mesh>
      <mesh position={[8.5, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[18, 10]} />
        <meshBasicMaterial color="#c8bba8" toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.2, 8.5]} rotation={[0, Math.PI, 0]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#e0d6c8" toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * Imported loft GLB, recentred and scaled to the interior only.
 * City / exterior meshes are hidden; an enclosure keeps the void out of frame.
 */
export function LivingRoomModel() {
  const { scene, animations } = useGLTF(LIVING_ROOM_GLB)
  const root = useRef<THREE.Group>(null)

  const prepared = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return

      if (isExteriorMesh(obj)) {
        obj.visible = false
        obj.castShadow = false
        obj.receiveShadow = false
        return
      }

      obj.castShadow = true
      obj.receiveShadow = true
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const mat of materials) {
        if (!mat) continue
        if ('envMapIntensity' in mat) (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.1
        if ('roughness' in mat && typeof (mat as THREE.MeshStandardMaterial).roughness === 'number') {
          const std = mat as THREE.MeshStandardMaterial
          std.roughness = Math.min(1, Math.max(0.2, std.roughness * 0.94))
        }
        mat.needsUpdate = true
      }
    })

    return clone
  }, [scene])

  // Keep clips available but do not autoplay — looping scene clips read as a spin.
  useAnimations(animations, root)

  useLayoutEffect(() => {
    const group = root.current
    if (!group) return

    group.position.set(0, 0, 0)
    group.scale.set(1, 1, 1)
    group.rotation.set(0, LIVING_ROOM_YAW, 0)
    group.updateMatrixWorld(true)

    const box = interiorBox(group)
    if (box.isEmpty()) return

    const size = box.getSize(new THREE.Vector3())
    const span = Math.max(size.x, size.z) || 1
    group.scale.setScalar(LIVING_ROOM_TARGET_SPAN / span)
    group.updateMatrixWorld(true)

    const fitted = interiorBox(group)
    const center = fitted.getCenter(new THREE.Vector3())
    group.position.set(-center.x, -fitted.min.y, -center.z)
    group.updateMatrixWorld(true)
  }, [prepared])

  return (
    <group>
      <group ref={root}>
        <primitive object={prepared} />
      </group>
      <InteriorEnclosure />
      <Suspense fallback={null}>
        <ContactPhone />
        <WallLogo />
      </Suspense>
    </group>
  )
}

useGLTF.preload(LIVING_ROOM_GLB)
