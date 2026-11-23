import { useLayoutEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The loft's plants were one branch photo, crossed two or three times.
 * Same photograph, broken into smaller sprigs at uneven angles, so the
 * crown is irregular instead of a flat cutout. Pots stay in the GLB.
 */

const SPRIG = '/images/plants/olive-sprig.webp'

type Kind = 'tree' | 'shrub' | 'sprig'

interface PlantSpot {
  kind: Kind
  position: [number, number, number]
  rotation: number
  seed: number
}

/** Vase mouths in the fitted loft (floor y = 0). */
const PLANTS: PlantSpot[] = [
  { kind: 'tree', position: [-1.2, 1.02, -0.42], rotation: 0.4, seed: 11 },
  { kind: 'shrub', position: [-0.54, 1.02, -0.4], rotation: 1.1, seed: 29 },
  { kind: 'tree', position: [4.5, 1.02, -0.42], rotation: 0.6, seed: 17 },
  { kind: 'sprig', position: [-5.06, 0.68, 4.02], rotation: 0.2, seed: 5 },
]

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Card {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
  color: THREE.Color
}

function layout(kind: Kind, seed: number): Card[] {
  const rand = mulberry32(seed)
  const tree = kind === 'tree'
  const sprig = kind === 'sprig'
  const count = sprig ? 4 : tree ? 8 : 12
  const reach = sprig ? 0.3 : tree ? 0.88 : 0.46
  const spread = sprig ? 0.06 : tree ? 0.11 : 0.09
  const cards: Card[] = []
  const tints = ['#f4f1e6', '#e6e2d0', '#f7f4ea', '#d9d3be', '#eee8d8']

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const yaw = rand() * Math.PI * 2
    const lean = spread * (0.15 + t * 0.7) * (0.7 + rand() * 0.5)
    const y = reach * (0.28 + t * 0.62) * (0.92 + rand() * 0.1)
    const h = (tree ? 0.7 : sprig ? 0.32 : 0.42) * (0.88 + rand() * 0.28)
    const flip = rand() > 0.5 ? -1 : 1
    const tilt = (rand() - 0.5) * 0.22
    const roll = (rand() - 0.5) * 0.25
    /* Photo has the stem at the top. Flip so the sprig grows up out of the pot. */
    const growUp = tree ? rand() > 0.3 : true
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, yaw, growUp ? Math.PI + roll : roll, 'YXZ'))
    cards.push({
      position: new THREE.Vector3(Math.cos(yaw) * lean, y, Math.sin(yaw) * lean),
      quaternion: q,
      scale: new THREE.Vector3(flip * h * 0.72, h, 1),
      color: new THREE.Color(tints[Math.floor(rand() * tints.length)]),
    })
  }
  return cards
}

function Plant({ spot }: { spot: PlantSpot }) {
  const map = useTexture(SPRIG)
  const cards = useMemo(() => layout(spot.kind, spot.seed), [spot.kind, spot.seed])
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map,
        roughness: 0.78,
        metalness: 0,
        side: THREE.DoubleSide,
        alphaTest: 0.45,
        transparent: false,
      }),
    [map],
  )
  const mesh = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    map.needsUpdate = true
    const inst = mesh.current
    if (!inst) return
    const dummy = new THREE.Object3D()
    cards.forEach((card, i) => {
      dummy.position.copy(card.position)
      dummy.quaternion.copy(card.quaternion)
      dummy.scale.copy(card.scale)
      dummy.updateMatrix()
      inst.setMatrixAt(i, dummy.matrix)
      inst.setColorAt(i, card.color)
    })
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  }, [cards, map])

  useLayoutEffect(
    () => () => {
      geo.dispose()
      mat.dispose()
    },
    [geo, mat],
  )

  return (
    <group position={spot.position} rotation={[0, spot.rotation, 0]}>
      <instancedMesh
        ref={mesh}
        args={[geo, mat, cards.length]}
        castShadow
        raycast={() => null}
      />
    </group>
  )
}

export function LoftPlants() {
  return (
    <group>
      {PLANTS.map((spot) => (
        <Plant key={`${spot.position.join(',')}-${spot.seed}`} spot={spot} />
      ))}
    </group>
  )
}

useTexture.preload(SPRIG)
