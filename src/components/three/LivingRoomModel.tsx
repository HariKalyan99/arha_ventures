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

/** Soft dusk beyond the glass — warm for Day, cooler ink for Night. */
function InteriorEnclosure({ noir }: { noir: boolean }) {
  const shell = noir ? '#0a0a0e' : '#14100c'
  const far = noir ? '#12151e' : '#4a3528'
  const left = noir ? '#0e1016' : '#2d2420'
  const right = noir ? '#0c0e14' : '#241c19'
  const near = noir ? '#08090c' : '#171717'

  return (
    <group>
      <mesh receiveShadow={false} castShadow={false}>
        <boxGeometry args={[28, 14, 28]} />
        <meshStandardMaterial
          color={shell}
          roughness={1}
          metalness={0}
          side={THREE.BackSide}
          envMapIntensity={noir ? 0.22 : 0.12}
        />
      </mesh>
      <mesh position={[0, 3.2, -8.5]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color={far} toneMapped={false} />
      </mesh>
      <mesh position={[-8.5, 3.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[18, 10]} />
        <meshBasicMaterial color={left} toneMapped={false} />
      </mesh>
      <mesh position={[8.5, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[18, 10]} />
        <meshBasicMaterial color={right} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.2, 8.5]} rotation={[0, Math.PI, 0]} receiveShadow={false} castShadow={false}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color={near} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Night: deepen toward charcoal + soft sheen — keep maps readable. */
function applyNoirLook(std: THREE.MeshStandardMaterial) {
  const next = std.clone() as THREE.MeshStandardMaterial

  next.color.lerp(new THREE.Color('#121216'), 0.28)
  next.color.multiplyScalar(0.78)

  if (typeof next.roughness === 'number') {
    next.roughness = Math.max(0.22, Math.min(0.85, next.roughness * 0.78))
  }
  next.metalness = Math.min(0.55, next.metalness + 0.06)
  next.envMapIntensity = Math.min(1.15, Math.max(0.7, (next.envMapIntensity ?? 1) * 1.15))

  if (next instanceof THREE.MeshPhysicalMaterial) {
    next.sheen = 0.65
    next.sheenColor.set('#d8d4cc')
    next.sheenRoughness = 0.32
    next.clearcoat = Math.min(0.2, next.clearcoat + 0.08)
    next.clearcoatRoughness = 0.35
  }

  if (next.name === 'Material.001' || next.name === 'Material.006') {
    next.color.set('#2a2622')
    next.roughness = 0.55
    next.metalness = 0.08
    next.envMapIntensity = 0.55
    if ('emissive' in next) next.emissive.set('#000000')
  }

  if (next.metalness > 0.55) {
    const goldish = next.color.r > 0.35 && next.color.g > 0.22 && next.color.b < 0.24
    if (goldish) {
      next.color.multiplyScalar(0.55)
      next.metalness = Math.min(next.metalness, 0.8)
      next.roughness = Math.max(0.28, next.roughness * 0.85)
      next.envMapIntensity = Math.min(1.1, next.envMapIntensity * 1.1)
    }
  }

  next.needsUpdate = true
  return next
}

function applyDayLook(std: THREE.MeshStandardMaterial) {
  const next = std.clone() as THREE.MeshStandardMaterial
  next.envMapIntensity = Math.min(next.envMapIntensity ?? 1, 0.95)
  if (typeof next.roughness === 'number') {
    next.roughness = Math.min(1, Math.max(0.22, next.roughness * 0.96))
  }

  if (next.metalness > 0.55) {
    const goldish = next.color.r > 0.4 && next.color.g > 0.28 && next.color.b < 0.26
    if (goldish) {
      next.metalness = Math.min(next.metalness, 0.72)
      next.roughness = Math.max(next.roughness, 0.32)
      next.color.multiplyScalar(0.88)
      next.envMapIntensity = Math.min(next.envMapIntensity, 0.75)
    }
  }

  if (next.name === 'Material.001' || next.name === 'Material.006') {
    next.color.set(next.map ? '#948c82' : '#a09890')
    next.roughness = Math.max(next.roughness, 0.82)
    next.metalness = 0
    next.envMapIntensity = Math.min(next.envMapIntensity, 0.35)
    if ('emissive' in next) next.emissive.set('#000000')
  }

  next.needsUpdate = true
  return next
}

interface LivingRoomModelProps {
  /** Site Night theme — darker plate + soft sheen */
  noir?: boolean
}

/**
 * Imported loft GLB — Day keeps a warm cinematic plate;
 * Night deepens toward black with a quiet sheen (still fully readable).
 */
export function LivingRoomModel({ noir = false }: LivingRoomModelProps) {
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

      const source = Array.isArray(obj.material) ? obj.material : [obj.material]
      const next = source.map((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return mat
        return noir ? applyNoirLook(mat) : applyDayLook(mat)
      })
      obj.material = next.length === 1 ? next[0]! : next
    })

    return clone
  }, [scene, noir])

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
      <InteriorEnclosure noir={noir} />
      <Suspense fallback={null}>
        <ContactPhone />
        <WallLogo />
      </Suspense>
    </group>
  )
}

useGLTF.preload(LIVING_ROOM_GLB)
