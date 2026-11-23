import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { LightingMood } from '../../data/configurator'
import type { MoodBlend } from './Lighting'
import { moods } from './moods'

/**
 * Day only. Shafts through the left window wall, a sun patch on the floor,
 * and a photographic flare when the camera looks toward that glass.
 * Fades as the tour eases from morning into evening.
 */

/** Just inside the left glazing, in the open panes under the mezzanine. */
const SUN = new THREE.Vector3(-5.02, 2.48, 0.28)

interface ShaftSpec {
  origin: [number, number, number]
  aim: [number, number, number]
  length: number
  width: number
  opacity: number
}

/** A little further into the room than the glass, still fading before the wall. */
const SHAFTS: ShaftSpec[] = [
  { origin: [-5.05, 2.5, 0.2], aim: [-1.2, 1.15, 2.55], length: 3.5, width: 1.05, opacity: 0.2 },
  { origin: [-5.05, 2.42, 0.3], aim: [-1.45, 1.2, 2.45], length: 3.3, width: 0.4, opacity: 0.36 },
  { origin: [-5.05, 2.18, -0.55], aim: [-1.7, 1.08, 1.25], length: 3.2, width: 0.48, opacity: 0.26 },
  { origin: [-5.0, 2.28, 1.55], aim: [-1.15, 1.12, 2.75], length: 3.3, width: 0.48, opacity: 0.24 },
  { origin: [-4.95, 1.88, 0.75], aim: [-1.5, 0.95, 2.2], length: 3.0, width: 0.85, opacity: 0.14 },
  { origin: [-5.08, 2.62, 0.05], aim: [-1.9, 1.45, 1.85], length: 3.1, width: 0.26, opacity: 0.32 },
]

const POOLS: { position: [number, number, number]; scale: [number, number]; rotation: number; opacity: number }[] = [
  { position: [-2.15, 0.08, 2.2], scale: [3.2, 2.1], rotation: 0.45, opacity: 0.18 },
  { position: [-3.3, 0.08, 1.05], scale: [2.4, 1.6], rotation: 0.22, opacity: 0.1 },
]

interface GhostSpec {
  /** 0 sits on the sun; larger values walk through the frame and out the other side. */
  t: number
  w: number
  h: number
  color: string
  opacity: number
  kind: 'streak' | 'orb' | 'chroma'
}

/** Soft ghosts near the glass — the earlier flare, without the starburst. */
const GHOSTS: GhostSpec[] = [
  { t: 0, w: 0.32, h: 0.006, color: '#ffe6d4', opacity: 0.42, kind: 'streak' },
  { t: -0.16, w: 0.09, h: 0.09, color: '#ffb4a8', opacity: 0.5, kind: 'orb' },
  { t: -0.4, w: 0.18, h: 0.18, color: '#ffffff', opacity: 0.58, kind: 'chroma' },
  { t: 0.58, w: 0.1, h: 0.1, color: '#ffffff', opacity: 0.36, kind: 'chroma' },
]

function canvasTexture(draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Texture()
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

function makeRayTexture() {
  return canvasTexture((g, w, h) => {
    const grad = g.createLinearGradient(0, h, 0, 0)
    grad.addColorStop(0, 'rgba(255,253,248,1)')
    grad.addColorStop(0.16, 'rgba(255,246,220,0.75)')
    grad.addColorStop(0.42, 'rgba(255,228,186,0.32)')
    grad.addColorStop(0.72, 'rgba(255,214,160,0.08)')
    grad.addColorStop(1, 'rgba(255,210,160,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
    g.globalCompositeOperation = 'destination-in'
    const side = g.createLinearGradient(0, 0, w, 0)
    side.addColorStop(0, 'rgba(0,0,0,0)')
    side.addColorStop(0.16, 'rgba(0,0,0,0.45)')
    side.addColorStop(0.5, 'rgba(0,0,0,1)')
    side.addColorStop(0.84, 'rgba(0,0,0,0.45)')
    side.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = side
    g.fillRect(0, 0, w, h)
  }, 128, 512)
}

function makeGlowTexture() {
  return canvasTexture((g, w, h) => {
    const c = Math.min(w, h) / 2
    const r = g.createRadialGradient(c, c, 0, c, c, c)
    r.addColorStop(0, 'rgba(255,255,250,1)')
    r.addColorStop(0.12, 'rgba(255,244,220,0.95)')
    r.addColorStop(0.38, 'rgba(255,214,160,0.35)')
    r.addColorStop(1, 'rgba(255,196,130,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
  }, 256, 256)
}

/** Soft bokeh disc. Sprite color tints it. */
function makeOrbTexture() {
  return canvasTexture((g, w, h) => {
    const c = w / 2
    g.filter = 'blur(12px)'
    const r = g.createRadialGradient(c, c, c * 0.02, c, c, c * 0.72)
    r.addColorStop(0, 'rgba(255,255,255,0.95)')
    r.addColorStop(0.42, 'rgba(255,255,255,0.5)')
    r.addColorStop(0.7, 'rgba(255,255,255,0.22)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
    g.filter = 'none'
  }, 256, 256)
}

/** One orb with a warm body and a green fringe, the way glass splits the light. */
function makeChromaTexture() {
  return canvasTexture((g, w, h) => {
    const c = w / 2
    g.filter = 'blur(16px)'
    const warm = g.createRadialGradient(c * 0.94, c, c * 0.02, c, c, c * 0.68)
    warm.addColorStop(0, 'rgba(255, 214, 140, 0.9)')
    warm.addColorStop(0.55, 'rgba(255, 150, 70, 0.32)')
    warm.addColorStop(1, 'rgba(255, 120, 40, 0)')
    g.fillStyle = warm
    g.fillRect(0, 0, w, h)
    const green = g.createRadialGradient(c * 1.08, c * 1.04, c * 0.08, c * 1.04, c, c * 0.55)
    green.addColorStop(0, 'rgba(170, 255, 140, 0)')
    green.addColorStop(0.62, 'rgba(150, 255, 120, 0.4)')
    green.addColorStop(1, 'rgba(120, 210, 255, 0)')
    g.fillStyle = green
    g.fillRect(0, 0, w, h)
    g.filter = 'none'
  }, 256, 256)
}

function makePoolTexture() {
  return canvasTexture((g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    r.addColorStop(0, 'rgba(255,236,205,0.95)')
    r.addColorStop(0.35, 'rgba(255,214,160,0.4)')
    r.addColorStop(0.7, 'rgba(255,196,140,0.08)')
    r.addColorStop(1, 'rgba(255,190,130,0)')
    g.fillStyle = r
    g.fillRect(0, 0, w, h)
  }, 256, 256)
}

function morningAmount(mood: LightingMood, blend: MoodBlend | undefined) {
  const t = blend ? THREE.MathUtils.clamp(blend.progress.current ?? 0, 0, 1) : 0
  const from = moods[blend?.from ?? mood].lamp
  const to = moods[blend?.to ?? mood].lamp
  const lamp = THREE.MathUtils.lerp(from, to, t)
  return THREE.MathUtils.clamp(1 - lamp * 2.15, 0, 1)
}

const _axis = new THREE.Vector3()
const _mid = new THREE.Vector3()
const _toCam = new THREE.Vector3()
const _side = new THREE.Vector3()
const _xAxis = new THREE.Vector3()
const _basis = new THREE.Matrix4()
const _up = new THREE.Vector3(0, 1, 0)
const _ndc = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _toSun = new THREE.Vector3()

function alignShaft(
  mesh: THREE.Mesh,
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  width: number,
  camera: THREE.Camera,
) {
  _axis.copy(dir).normalize()
  _mid.copy(origin).addScaledVector(_axis, length * 0.5)
  _toCam.copy(camera.position).sub(_mid)
  _side.copy(_toCam).addScaledVector(_axis, -_toCam.dot(_axis))
  if (_side.lengthSq() < 1e-8) _side.crossVectors(_axis, Math.abs(_axis.y) > 0.92 ? _xAxis.set(1, 0, 0) : _up)
  _side.normalize()
  _xAxis.crossVectors(_axis, _side).normalize()
  _basis.makeBasis(_xAxis, _axis, _side)
  mesh.quaternion.setFromRotationMatrix(_basis)
  mesh.position.copy(_mid)
  mesh.scale.set(width, length, 1)
}

interface MorningSunProps {
  mood: LightingMood
  blend?: MoodBlend
}

export function MorningSun({ mood, blend }: MorningSunProps) {
  const camera = useThree((s) => s.camera)
  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const textures = useMemo(
    () => ({
      ray: makeRayTexture(),
      glow: makeGlowTexture(),
      orb: makeOrbTexture(),
      chroma: makeChromaTexture(),
      pool: makePoolTexture(),
    }),
    [],
  )

  const shafts = useMemo(
    () =>
      SHAFTS.map((spec) => ({
        spec,
        origin: new THREE.Vector3(...spec.origin),
        dir: new THREE.Vector3(...spec.aim).sub(new THREE.Vector3(...spec.origin)).normalize(),
      })),
    [],
  )

  const shaftRefs = useRef<(THREE.Mesh | null)[]>([])
  const ghostRefs = useRef<(THREE.Sprite | null)[]>([])
  const sunRefs = useRef<(THREE.Sprite | null)[]>([])
  const poolRefs = useRef<(THREE.Mesh | null)[]>([])
  const ghostPos = useMemo(() => new THREE.Vector3(), [])

  useLayoutEffect(
    () => () => {
      textures.ray.dispose()
      textures.glow.dispose()
      textures.orb.dispose()
      textures.chroma.dispose()
      textures.pool.dispose()
    },
    [textures],
  )

  useFrame((state) => {
    const morning = morningAmount(mood, blend)
    const t = reduce ? 0 : state.clock.elapsedTime

    shafts.forEach((shaft, i) => {
      const mesh = shaftRefs.current[i]
      if (!mesh) return
      alignShaft(mesh, shaft.origin, shaft.dir, shaft.spec.length, shaft.spec.width, camera)
      const mat = mesh.material as THREE.MeshBasicMaterial
      const breathe = reduce ? 1 : 0.9 + 0.1 * Math.sin(t * 0.32 + i * 1.4)
      mat.opacity = shaft.spec.opacity * morning * breathe
    })

    poolRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = POOLS[i].opacity * morning
    })

    const sunMat = (index: number) => sunRefs.current[index]?.material as THREE.SpriteMaterial | undefined
    const core = sunMat(0)
    const halo = sunMat(1)
    camera.getWorldDirection(_forward)
    _toSun.copy(SUN).sub(camera.position)
    const sunDist = _toSun.length()
    _toSun.multiplyScalar(1 / Math.max(sunDist, 1e-4))
    const facing = _forward.dot(_toSun)
    const sunFade = THREE.MathUtils.smoothstep(facing, 0.02, 0.42) * morning
    if (core) core.opacity = sunFade
    if (halo) halo.opacity = 0.38 * sunFade

    _ndc.copy(SUN).project(camera)
    const inFront = _ndc.z < 1
    const edge = 1 - Math.max(Math.abs(_ndc.x), Math.abs(_ndc.y))
    const edgeFade = THREE.MathUtils.smoothstep(edge, -0.15, 0.28)
    const faceFade = THREE.MathUtils.smoothstep(facing, 0.2, 0.7)
    const flare = (inFront ? 1 : 0) * edgeFade * faceFade * morning
    const persp = camera as THREE.PerspectiveCamera

    ghostRefs.current.forEach((sprite, i) => {
      if (!sprite) return
      const ghost = GHOSTS[i]
      const along = 1 - ghost.t
      const gx = _ndc.x * along
      const gy = _ndc.y * along
      ghostPos.set(gx, gy, 0.2).unproject(camera)
      sprite.position.copy(ghostPos)
      const dist = Math.max(camera.position.distanceTo(ghostPos), 0.2)
      const halfH = Math.tan(((persp.fov ?? 45) * Math.PI) / 360) * dist
      sprite.scale.set(halfH * 2 * ghost.w, halfH * 2 * ghost.h, 1)
      const mat = sprite.material as THREE.SpriteMaterial
      const twinkle = reduce ? 1 : 0.92 + 0.08 * Math.sin(t * 0.8 + i)
      const presence = THREE.MathUtils.clamp(flare * 1.45, 0, 1)
      mat.opacity = ghost.opacity * presence * twinkle
      sprite.visible = flare > 0.01
    })
  })

  const rayMaterial = (opacity: number) => (
    <meshBasicMaterial
      map={textures.ray}
      color="#fff1d2"
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      toneMapped={false}
      fog={false}
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  )

  return (
    <group>
      {shafts.map((shaft, i) => (
        <mesh
          key={i}
          ref={(node) => {
            shaftRefs.current[i] = node
          }}
          frustumCulled={false}
          renderOrder={2}
          raycast={() => null}
        >
          <planeGeometry args={[1, 1]} />
          {rayMaterial(shaft.spec.opacity)}
        </mesh>
      ))}

      {POOLS.map((pool, i) => (
        <mesh
          key={i}
          ref={(node) => {
            poolRefs.current[i] = node
          }}
          position={pool.position}
          rotation={[-Math.PI / 2, 0, pool.rotation]}
          scale={[pool.scale[0], pool.scale[1], 1]}
          renderOrder={2}
          raycast={() => null}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={textures.pool}
            color="#ffc98a"
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
            opacity={pool.opacity}
            polygonOffset
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
          />
        </mesh>
      ))}

      <sprite
        ref={(node) => {
          sunRefs.current[0] = node
        }}
        position={SUN}
        scale={[0.9, 0.9, 1]}
        renderOrder={4}
        raycast={() => null}
      >
        <spriteMaterial
          map={textures.glow}
          color="#fffaf2"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
          opacity={0.9}
        />
      </sprite>
      <sprite
        ref={(node) => {
          sunRefs.current[1] = node
        }}
        position={SUN}
        scale={[2.2, 2.2, 1]}
        renderOrder={3}
        raycast={() => null}
      >
        <spriteMaterial
          map={textures.glow}
          color="#ffd7a4"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
          opacity={0.4}
        />
      </sprite>

      {GHOSTS.map((ghost, i) => (
        <sprite
          key={i}
          ref={(node) => {
            ghostRefs.current[i] = node
          }}
          frustumCulled={false}
          renderOrder={20}
          raycast={() => null}
        >
          <spriteMaterial
            map={ghost.kind === 'chroma' ? textures.chroma : ghost.kind === 'orb' ? textures.orb : textures.glow}
            color={ghost.color}
            transparent
            depthTest={false}
            depthWrite={false}
            blending={ghost.kind === 'orb' || ghost.kind === 'chroma' ? THREE.NormalBlending : THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
            opacity={0}
          />
        </sprite>
      ))}
    </group>
  )
}
