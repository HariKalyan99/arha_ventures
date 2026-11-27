import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Shelf-corner join: wood fascia meets the beige end-wall return.
 * The beige plane is authored short — extend it to the right (+Z).
 */
const BEAM = {
  faceZ: -0.816,
  faceDepth: 0.07,
  y0: 3.30,
  y1: 3.50,
  xEnd: 5.186,
} as const

/** Beige end wall — −X face at the shelf corner, run further +Z (screen-right). */
const WALL_X = 5.22
const WALL_Z0 = -0.93
const WALL_Z1 = 3.35
const WALL_Y0 = 0.05
const WALL_Y1 = 3.55

const WOOD = '#e6ddd0'
const PLASTER = '#d6cec2'

export function ShelfCornerMezzJoin() {
  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WOOD,
        roughness: 0.7,
        metalness: 0,
        envMapIntensity: 0.35,
        side: THREE.FrontSide,
      }),
    [],
  )

  const plasterMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PLASTER,
        roughness: 0.95,
        metalness: 0,
        envMapIntensity: 0.2,
        side: THREE.FrontSide,
      }),
    [],
  )

  const beamH = BEAM.y1 - BEAM.y0
  const beamY = (BEAM.y0 + BEAM.y1) / 2
  const extend = WALL_X - BEAM.xEnd

  return (
    <group>
      <mesh
        position={[(BEAM.xEnd + WALL_X) / 2, beamY, BEAM.faceZ + BEAM.faceDepth / 2]}
        material={woodMat}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[extend + 0.02, beamH, BEAM.faceDepth]} />
      </mesh>

      <mesh
        position={[WALL_X - 0.035, beamY, BEAM.faceZ - 0.02]}
        material={woodMat}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.07, beamH + 0.02, 0.12]} />
      </mesh>

      <mesh
        position={[(BEAM.xEnd + WALL_X) / 2, BEAM.y0 - 0.015, BEAM.faceZ]}
        material={woodMat}
        receiveShadow
      >
        <boxGeometry args={[extend + 0.08, 0.03, 0.1]} />
      </mesh>

      {/* Beige end wall — extended to the right */}
      <mesh
        position={[WALL_X - 0.04, (WALL_Y0 + WALL_Y1) / 2, (WALL_Z0 + WALL_Z1) / 2]}
        material={plasterMat}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.08, WALL_Y1 - WALL_Y0, WALL_Z1 - WALL_Z0]} />
      </mesh>
    </group>
  )
}
