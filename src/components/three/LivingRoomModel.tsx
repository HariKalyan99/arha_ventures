import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF, useAnimations, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LIVING_ROOM_GLB, LIVING_ROOM_TARGET_SPAN, LIVING_ROOM_YAW } from './roomSource'
import { ContactPhone } from './ContactPhone'
import { LoftPlants } from './LoftPlants'
import { WallLogo } from './WallLogo'

/* night.webp = dark skyline, day.webp = morning/dusk sky — H&M framing locked */
const CITY_NIGHT = '/images/skyscraper/night.webp?v=canva25'
const CITY_DAY = '/images/skyscraper/day.webp?v=canva25'
/* H&M v differs (day plate has extra sky) — offset so mid-pane (uv.y=0.5) hits H&M */
const CITY_UV_Y = { night: -0.096, day: -0.151 } as const

/**
 * Photo skyline behind the panes — unlit so leather / walls don’t pick up a cast.
 * Angle locked; only replaces Sketchfab city blocks (interior stays as authored).
 */
function ExteriorCity({ noir }: { noir: boolean }) {
  const { gl } = useThree()
  const map = useTexture(noir ? CITY_NIGHT : CITY_DAY)

  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping
    map.offset.set(0, noir ? CITY_UV_Y.night : CITY_UV_Y.day)
    map.repeat.set(1, 1)
    map.needsUpdate = true
  }, [map, gl, noir])

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map,
        color: noir ? '#ffffff' : '#fff4e8',
        side: THREE.DoubleSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [map, noir],
  )

  useLayoutEffect(() => {
    const prev = gl.getClearColor(new THREE.Color())
    const prevA = gl.getClearAlpha()
    /* Neutral clear — same as pre-photo loft (never wash the interior). */
    gl.setClearColor(noir ? '#0a0c12' : '#c8bdb0', 1)
    return () => gl.setClearColor(prev, prevA)
  }, [gl, noir])

  useLayoutEffect(
    () => () => {
      mat.dispose()
    },
    [mat],
  )

  return (
    <group>
      {/* Locked window angle — H&M on long-pane Y midline */}
      <mesh position={[-13.5, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[34, 26]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[-12.2, 0.4, -6.8]} rotation={[0, Math.PI * 0.4, 0]} frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[24, 20]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  )
}

/**
 * Sketchfab city blocks only — hide these for the photo backdrop.
 * Glass / frames / loft materials stay visible (original aesthetics).
 */
const CITY_BLOCK_MATERIALS = new Set([
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

function isCityBlockMesh(mesh: THREE.Mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  if (mats.some((m) => m && CITY_BLOCK_MATERIALS.has(m.name))) return true
  if (/^Plane007_/.test(mesh.name)) return true
  return false
}

/** Repeated branch cards in the vases — replaced by LoftPlants. Pots stay. */
function isSketchfabFoliage(mesh: THREE.Mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  return mats.some((m) => m && m.name === 'Material.022')
}

/** Same set used for fit-span exclusion (loft framing, not skyline). */
function isExteriorMesh(mesh: THREE.Mesh) {
  return isCityBlockMesh(mesh)
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

/** Sectional + lounge leather. Roughness ~0.2 was clipping to white in morning light. */
const DAY_LEATHER = new Set(['Material.012', 'Material.013'])

function settleDayLeather(std: THREE.MeshStandardMaterial) {
  if (!DAY_LEATHER.has(std.name)) return std
  const next = std.clone() as THREE.MeshStandardMaterial
  next.roughness = Math.max(next.roughness, 0.62)
  next.metalness = Math.min(next.metalness ?? 0, 0.02)
  next.envMapIntensity = 0.42
  next.needsUpdate = true
  return next
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
 * free_loft_17 interior as authored — photo skyline replaces city blocks only.
 * Plaque + telephone stay. Day keeps the loft, with the sofa leather settled so morning light does not clip it.
 */
export function LivingRoomModel({ noir = false }: LivingRoomModelProps) {
  /* false = no Draco, true = Meshopt (matches optimized free_loft_17.glb) */
  const { scene, animations } = useGLTF(LIVING_ROOM_GLB, false, true)
  const root = useRef<THREE.Group>(null)

  const prepared = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return

      const cityBlock = isCityBlockMesh(obj)
      const foliage = isSketchfabFoliage(obj)
      /* Hide blocky Sketchfab scrapers only — keep glass + loft aesthetics. */
      obj.visible = !cityBlock && !foliage
      const exterior = isExteriorMesh(obj)
      obj.castShadow = !exterior && !foliage
      obj.receiveShadow = !exterior && !foliage

      const source = Array.isArray(obj.material) ? obj.material : [obj.material]
      const next = source.map((mat) => {
        if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return mat

        if (!noir) {
          /* Day — keep the loft as authored; soften night-city emissives for morning. */
          if (!exterior) return settleDayLeather(mat)
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
      <Suspense fallback={null}>
        <ExteriorCity noir={noir} />
      </Suspense>
      <group ref={root}>
        <primitive object={prepared} />
      </group>
      <Suspense fallback={null}>
        <ContactPhone />
        <WallLogo />
        <LoftPlants />
      </Suspense>
    </group>
  )
}

useGLTF.preload(LIVING_ROOM_GLB, false, true)
useTexture.preload(CITY_NIGHT)
useTexture.preload(CITY_DAY)
