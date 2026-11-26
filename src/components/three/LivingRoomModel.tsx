import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { contentBox } from './modelBounds'
import { LIVING_ROOM_GLB, LIVING_ROOM_TARGET_SPAN, LIVING_ROOM_YAW } from './roomSource'
import { ContactPhone } from './ContactPhone'
import { WallLogo } from './WallLogo'

/** Night theme only — gentle charcoal deepen. Day keeps the GLB as authored. */
function applyNoirLook(std: THREE.MeshStandardMaterial) {
  const next = std.clone() as THREE.MeshStandardMaterial
  next.color.lerp(new THREE.Color('#161412'), 0.18)
  next.color.multiplyScalar(0.88)
  if (typeof next.roughness === 'number') {
    next.roughness = Math.max(0.22, Math.min(0.85, next.roughness * 0.9))
  }
  next.envMapIntensity = Math.min(1.1, Math.max(0.65, (next.envMapIntensity ?? 1) * 1.05))
  next.side = THREE.DoubleSide
  next.needsUpdate = true
  return next
}

interface LivingRoomModelProps {
  /** Site Night theme — darker plate */
  noir?: boolean
}

/**
 * Sraven interior — meshopt GLB fitted on the furnished core (not the empty shell AABB).
 * Plaque + telephone stay as contact affordances.
 */
export function LivingRoomModel({ noir = false }: LivingRoomModelProps) {
  /* false = no Draco, true = Meshopt (matches optimized sraven-interior.glb) */
  const { scene } = useGLTF(LIVING_ROOM_GLB, false, true)
  const root = useRef<THREE.Group>(null)

  const prepared = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return

      obj.castShadow = true
      obj.receiveShadow = true
      obj.frustumCulled = false

      const source = Array.isArray(obj.material) ? obj.material : [obj.material]
      const next = source.map((mat) => {
        if (!mat) return mat
        /* Clone so we never poison the useGLTF cache shared with the review page. */
        if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
          const base = noir ? applyNoirLook(mat) : (mat.clone() as THREE.MeshStandardMaterial)
          base.side = THREE.DoubleSide
          base.needsUpdate = true
          return base
        }
        const copy = mat.clone()
        copy.side = THREE.DoubleSide
        copy.needsUpdate = true
        return copy
      })
      obj.material = next.length === 1 ? next[0]! : next
    })

    return clone
  }, [scene, noir])

  useLayoutEffect(() => {
    const group = root.current
    if (!group) return

    group.position.set(0, 0, 0)
    group.scale.set(1, 1, 1)
    group.rotation.set(0, LIVING_ROOM_YAW, 0)
    group.updateMatrixWorld(true)

    const core = contentBox(group)
    if (core.isEmpty()) return

    const size = core.getSize(new THREE.Vector3())
    const span = Math.max(size.x, size.z) || 1
    const scale = LIVING_ROOM_TARGET_SPAN / span
    group.scale.setScalar(scale)
    group.updateMatrixWorld(true)

    /* Transform the same core — don’t re-query (outliers would inflate it again). */
    const fitted = core.clone()
    fitted.min.multiplyScalar(scale)
    fitted.max.multiplyScalar(scale)
    const center = fitted.getCenter(new THREE.Vector3())
    group.position.set(-center.x, -fitted.min.y, -center.z)
    group.updateMatrixWorld(true)
  }, [prepared])

  return (
    <group>
      <group ref={root}>
        <primitive object={prepared} />
      </group>
      <Suspense fallback={null}>
        <ContactPhone />
        <WallLogo />
      </Suspense>
    </group>
  )
}

useGLTF.preload(LIVING_ROOM_GLB, false, true)
