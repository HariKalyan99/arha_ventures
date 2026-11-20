import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SLAT_WALLS } from '../../data/configurator'
import { ROOM, useRoom } from './roomContext'

const WIDTH = ROOM.maxX - ROOM.minX
const DEPTH = ROOM.frontZ - ROOM.backZ
const CENTER_Z = (ROOM.frontZ + ROOM.backZ) / 2

/** The fireplace panel occupies this z-range on the feature wall. */
const PANEL = { start: -2.35, end: 1.15 }
const FIRE = { start: -1.75, end: 0.55, bottom: 0.52, top: 0.98 }

export function Architecture() {
  return (
    <group>
      <Floor />
      <Ceiling />
      <BackWall />
      <RightWall />
      <FeatureWall />
      <Exterior />
    </group>
  )
}

function Floor() {
  const { lib, finishes } = useRoom()
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, CENTER_Z]} receiveShadow material={lib.floor[finishes.floor]}>
      <planeGeometry args={[WIDTH, DEPTH]} />
    </mesh>
  )
}

function Ceiling() {
  const { lib, rig } = useRoom()
  const inset = 0.6
  const panelW = WIDTH - inset * 2
  const panelD = DEPTH - inset * 2
  const downlights: [number, number][] = [
    [-2.4, -1.9],
    [-2.4, 0.9],
    [3.6, -2.2],
    [3.6, -0.9],
    [3.6, 2.2],
  ]
  return (
    <group>
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM.height, CENTER_Z]} material={lib.ceiling} castShadow receiveShadow>
        <planeGeometry args={[WIDTH, DEPTH]} />
      </mesh>
      {/* Dropped plaster panel; the gap around it reveals the concealed cove light */}
      <mesh position={[0, ROOM.height - 0.09, CENTER_Z]} material={lib.ceiling} castShadow receiveShadow>
        <boxGeometry args={[panelW, 0.06, panelD]} />
      </mesh>
      {[
        { pos: [0, ROOM.height - 0.03, ROOM.backZ + inset - 0.12] as const, size: [panelW, 0.02, 0.04] as const },
        { pos: [ROOM.minX + inset - 0.12, ROOM.height - 0.03, CENTER_Z] as const, size: [0.04, 0.02, panelD] as const },
        { pos: [ROOM.maxX - inset + 0.12, ROOM.height - 0.03, CENTER_Z] as const, size: [0.04, 0.02, panelD] as const },
      ].map((strip, i) => (
        <mesh key={i} position={strip.pos} material={rig.cove}>
          <boxGeometry args={strip.size} />
        </mesh>
      ))}
      {downlights.map(([x, z], i) => (
        <mesh key={i} position={[x, ROOM.height - 0.125, z]} material={rig.bulb}>
          <cylinderGeometry args={[0.045, 0.045, 0.01, 20]} />
        </mesh>
      ))}
    </group>
  )
}

function BackWall() {
  const { lib } = useRoom()
  const solidW = ROOM.glazingStartX - ROOM.minX
  const glazingW = ROOM.maxX - ROOM.glazingStartX
  const mullions = useMemo(() => {
    const count = 6
    return Array.from({ length: count + 1 }, (_, i) => ROOM.glazingStartX + (glazingW / count) * i)
  }, [glazingW])

  return (
    <group>
      <mesh position={[ROOM.minX + solidW / 2, ROOM.height / 2, ROOM.backZ - 0.05]} material={lib.plaster} castShadow receiveShadow>
        <boxGeometry args={[solidW, ROOM.height, 0.1]} />
      </mesh>
      {/* Floor-to-ceiling glazing: slim bronze frame, mullions and a single glass plane */}
      <mesh position={[ROOM.glazingStartX + glazingW / 2, ROOM.height - 0.04, ROOM.backZ]} material={lib.frame} castShadow>
        <boxGeometry args={[glazingW, 0.08, 0.14]} />
      </mesh>
      <mesh position={[ROOM.glazingStartX + glazingW / 2, 0.02, ROOM.backZ]} material={lib.frame}>
        <boxGeometry args={[glazingW, 0.04, 0.14]} />
      </mesh>
      {mullions.map((x) => (
        <mesh key={x} position={[x, ROOM.height / 2, ROOM.backZ]} material={lib.frame} castShadow>
          <boxGeometry args={[0.05, ROOM.height, 0.12]} />
        </mesh>
      ))}
      <mesh position={[ROOM.glazingStartX + glazingW / 2, ROOM.height / 2, ROOM.backZ]} material={lib.glass} renderOrder={2}>
        <planeGeometry args={[glazingW, ROOM.height]} />
      </mesh>
      {/* Sheer curtain stacked at the solid corner */}
      <mesh position={[ROOM.glazingStartX + 0.35, ROOM.height / 2 - 0.05, ROOM.backZ + 0.18]} castShadow>
        <boxGeometry args={[0.55, ROOM.height - 0.2, 0.12]} />
        <meshStandardMaterial color="#d9cfbf" roughness={1} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function RightWall() {
  const { lib } = useRoom()
  return (
    <mesh position={[ROOM.maxX + 0.05, ROOM.height / 2, CENTER_Z]} material={lib.plaster} castShadow receiveShadow>
      <boxGeometry args={[0.1, ROOM.height, DEPTH]} />
    </mesh>
  )
}

function FeatureWall() {
  const { lib, finishes } = useRoom()
  const x = ROOM.minX
  const panelW = PANEL.end - PANEL.start
  const panelMid = (PANEL.start + PANEL.end) / 2
  const fireW = FIRE.end - FIRE.start
  const fireH = FIRE.top - FIRE.bottom
  const fireMid = (FIRE.start + FIRE.end) / 2

  return (
    <group>
      {SLAT_WALLS.has(finishes.wall) ? (
        <Slats />
      ) : (
        <mesh position={[x + 0.02, ROOM.height / 2, CENTER_Z]} rotation-y={Math.PI / 2} material={lib.wall[finishes.wall]} receiveShadow>
          <planeGeometry args={[DEPTH, ROOM.height]} />
        </mesh>
      )}
      <mesh position={[x - 0.05, ROOM.height / 2, CENTER_Z]} material={lib.slatBacking} castShadow>
        <boxGeometry args={[0.1, ROOM.height, DEPTH]} />
      </mesh>

      {/* Full-height Nero marble panel framing the fire */}
      <mesh position={[x + 0.07, ROOM.height / 2, panelMid]} material={lib.nero} castShadow receiveShadow>
        <boxGeometry args={[0.12, ROOM.height, panelW]} />
      </mesh>
      <mesh position={[x + 0.135, FIRE.bottom + fireH / 2, fireMid]} rotation-y={Math.PI / 2} material={lib.firebox}>
        <planeGeometry args={[fireW, fireH]} />
      </mesh>
      <Fire position={[x + 0.14, FIRE.bottom + fireH / 2, fireMid]} size={[fireW - 0.1, fireH - 0.04]} />
      {/* Hearth bench */}
      <mesh position={[x + 0.4, 0.17, panelMid]} material={lib.stone} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.34, panelW + 1.8]} />
      </mesh>
    </group>
  )
}

function Fire({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const { rig } = useRoom()
  return (
    <mesh position={position} rotation-y={Math.PI / 2} material={rig.fire} renderOrder={3}>
      <planeGeometry args={size} />
    </mesh>
  )
}

/** Fluted timber wall rendered as a single instanced mesh. */
function Slats() {
  const { lib, finishes } = useRoom()
  const ref = useRef<THREE.InstancedMesh>(null)
  const positions = useMemo(() => {
    const spacing = 0.085
    const out: number[] = []
    for (let z = ROOM.backZ + 0.05; z < ROOM.frontZ; z += spacing) {
      if (z > PANEL.start - 0.04 && z < PANEL.end + 0.04) continue
      out.push(z)
    }
    return out
  }, [])
  const slatMaterial = SLAT_WALLS.has(finishes.wall) ? lib.wall[finishes.wall] : lib.wall['walnut-slats']

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    positions.forEach((z, i) => {
      m.makeTranslation(ROOM.minX + 0.03, ROOM.height / 2, z)
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [positions])

  return (
    <instancedMesh key={finishes.wall} ref={ref} args={[undefined, slatMaterial, positions.length]} receiveShadow castShadow>
      <boxGeometry args={[0.05, ROOM.height, 0.045]} />
    </instancedMesh>
  )
}

function Exterior() {
  const { lib, rig } = useRoom()
  return (
    <group>
      {/* Terrace */}
      <mesh rotation-x={-Math.PI / 2} position={[1, -0.01, ROOM.backZ - 4]} material={lib.terrace} receiveShadow>
        <planeGeometry args={[30, 8]} />
      </mesh>
      {/* Infinity pool */}
      <mesh rotation-x={-Math.PI / 2} position={[2.4, 0.002, ROOM.backZ - 3.6]} material={rig.pool}>
        <planeGeometry args={[7.5, 2.6]} />
      </mesh>
      {/* Low stone parapet at the terrace edge */}
      <mesh position={[1, 0.25, ROOM.backZ - 8]} material={lib.stone} castShadow receiveShadow>
        <boxGeometry args={[30, 0.5, 0.3]} />
      </mesh>
      {/* Sea and distant headlands */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -6, -160]} material={rig.sea}>
        <planeGeometry args={[800, 300]} />
      </mesh>
      <mesh position={[-120, -6, -290]} scale={[110, 11, 30]} material={rig.hills}>
        <sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[150, -6, -300]} scale={[80, 7, 30]} material={rig.hills}>
        <sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={rig.sky} renderOrder={-1}>
        <sphereGeometry args={[320, 32, 16]} />
      </mesh>
    </group>
  )
}
