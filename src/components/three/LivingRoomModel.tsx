import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LIVING_ROOM_GLB, LIVING_ROOM_TARGET_SPAN, LIVING_ROOM_YAW } from './roomSource'
import { ContactPhone } from './ContactPhone'
import { WallLogo } from './WallLogo'

/**
 * Day: blue sky billboards ONLY outside the window wall (through the panes).
 * Unlit + not surrounding the room — so leather / walls don’t pick up a blue cast.
 * Clear color stays warm/neutral like the hero plate.
 */
function ExteriorSky({ noir }: { noir: boolean }) {
  const { gl } = useThree()
  const mat = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 4
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, '#5a9ad4')
    g.addColorStop(0.5, '#8eb8e0')
    g.addColorStop(0.82, '#c5d8ec')
    g.addColorStop(1, '#d8e4f0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 64)
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.needsUpdate = true
    return new THREE.MeshBasicMaterial({
      map,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    })
  }, [])

  useLayoutEffect(() => {
    const prev = gl.getClearColor(new THREE.Color())
    const prevA = gl.getClearAlpha()
    /* Neutral clear — never blue (that was washing the interior). */
    gl.setClearColor(noir ? '#0a0c12' : '#c8bdb0', 1)
    return () => gl.setClearColor(prev, prevA)
  }, [gl, noir])

  useLayoutEffect(
    () => () => {
      mat.map?.dispose()
      mat.dispose()
    },
    [mat],
  )

  if (noir) return null

  return (
    <group>
      {/* Primary window wall — left / −X (Sketchfab panes) */}
      <mesh position={[-14, 4.5, 1.5]} rotation={[0, Math.PI / 2, 0]} frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[28, 16]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Far corner peek through the same glass run */}
      <mesh position={[-10, 5.5, -8]} rotation={[0, Math.PI * 0.35, 0]} frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[18, 12]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  )
}

/**
 * City / exterior blocks — keep them visible (Sketchfab look) but exclude from
 * the fit span so the loft doesn’t shrink to the skyline.
 */
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

/** Interior-only bounds for framing. */
function interiorBox(root: THREE.Object3D) {
  const box = new THREE.Box3()
  const temp = new THREE.Box3()
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.visible) return
    if (isExteriorMesh(obj)) return
    const geom = obj.geometry
    if (!geom.boundingBox) geom.computeBoundingBox()
    if (!geom.boundingBox) return
    temp.copy(geom.boundingBox).applyMatrix4(obj.matrixWorld)
    box.union(temp)
  })
  return box
}

/** Night theme only — gentle charcoal deepen. Day keeps the GLB as authored. */
function applyNoirLook(std: THREE.MeshStandardMaterial) {
  const next = std.clone() as THREE.MeshStandardMaterial
  next.color.lerp(new THREE.Color('#121216'), 0.22)
  next.color.multiplyScalar(0.82)
  if (typeof next.roughness === 'number') {
    next.roughness = Math.max(0.22, Math.min(0.85, next.roughness * 0.82))
  }
  next.envMapIntensity = Math.min(1.1, Math.max(0.65, (next.envMapIntensity ?? 1) * 1.1))
  next.needsUpdate = true
  return next
}

interface LivingRoomModelProps {
  /** Site Night theme — darker plate */
  noir?: boolean
}

/**
 * free_loft_17 as on Sketchfab — city through the panes, no fake enclosure.
 * Plaque + telephone stay. Day uses original materials; lighting carries morning.
 */
export function LivingRoomModel({ noir = false }: LivingRoomModelProps) {
  /* false = no Draco, true = Meshopt (matches optimized free_loft_17.glb) */
  const { scene, animations } = useGLTF(LIVING_ROOM_GLB, false, true)
  const root = useRef<THREE.Group>(null)

  const prepared = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return

      obj.visible = true
      const exterior = isExteriorMesh(obj)
      obj.castShadow = !exterior
      obj.receiveShadow = !exterior

      const source = Array.isArray(obj.material) ? obj.material : [obj.material]
      const next = source.map((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return mat

        if (!noir) {
          /* Day — keep the loft as authored; soften night-city emissives for morning. */
          if (!exterior) return mat
          const day = mat.clone() as THREE.MeshStandardMaterial
          if ('emissiveIntensity' in day && typeof day.emissiveIntensity === 'number') {
            day.emissiveIntensity *= 0.35
          }
          if ('emissive' in day) day.emissive.multiplyScalar(0.4)
          day.needsUpdate = true
          return day
        }

        return applyNoirLook(mat)
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
      <ExteriorSky noir={noir} />
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
