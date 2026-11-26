import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Framed print on the beige shelf end wall.
 * Warm ink mountains from the loft’s own art set (Material.018) —
 * same family as the existing frames.
 */
const ART_MAP = '/images/loft-ink-mountains.webp'

/** Portrait — matches free_loft art cards. */
const PRINT_W = 0.82
const PRINT_H = 1.36
const MAT_INSET = 0.022
const RAIL = 0.018
const FRAME_DEPTH = 0.03
const RECESS = 0.008

interface WallArtProps {
  noir?: boolean
}

export function WallArt({ noir = false }: WallArtProps) {
  const map = useTexture(ART_MAP)

  const printMat = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    map.needsUpdate = true
    return new THREE.MeshStandardMaterial({
      map,
      /* Texture already has warm sepia baked in — keep the multiply cool. */
      color: new THREE.Color(noir ? '#f4f0ea' : '#faf8f4'),
      roughness: 0.9,
      metalness: 0,
      envMapIntensity: noir ? 0.42 : 0.32,
      side: THREE.FrontSide,
    })
  }, [map, noir])

  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: noir ? '#0c0a08' : '#161412',
        roughness: 0.92,
        metalness: 0,
        envMapIntensity: 0.15,
        side: THREE.FrontSide,
      }),
    [noir],
  )

  const matBoard = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: noir ? '#1a1612' : '#2a241e',
        roughness: 0.96,
        metalness: 0,
        side: THREE.FrontSide,
      }),
    [noir],
  )

  const overlayMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#c4a078',
        transparent: true,
        opacity: noir ? 0.035 : 0.025,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [noir],
  )

  const matW = PRINT_W + MAT_INSET * 2
  const matH = PRINT_H + MAT_INSET * 2
  const outerW = matW + RAIL * 2

  const rails = useMemo(() => {
    const d = FRAME_DEPTH
    return [
      { pos: [0, (matH + RAIL) / 2, 0] as const, size: [outerW, RAIL, d] as const },
      { pos: [0, -(matH + RAIL) / 2, 0] as const, size: [outerW, RAIL, d] as const },
      { pos: [-(matW + RAIL) / 2, 0, 0] as const, size: [RAIL, matH, d] as const },
      { pos: [(matW + RAIL) / 2, 0, 0] as const, size: [RAIL, matH, d] as const },
    ]
  }, [matH, matW, outerW])

  return (
    <group position={[5.12, 1.72, 0.55]} rotation={[0, -Math.PI / 2, 0]}>
      {rails.map((rail, i) => (
        <mesh key={i} position={rail.pos} material={frameMat} castShadow receiveShadow>
          <boxGeometry args={[...rail.size]} />
        </mesh>
      ))}
      <mesh position={[0, 0, -FRAME_DEPTH / 2 + 0.002]} material={frameMat} receiveShadow>
        <boxGeometry args={[matW + 0.002, matH + 0.002, 0.006]} />
      </mesh>
      <mesh position={[0, 0, -RECESS]} material={matBoard} receiveShadow>
        <boxGeometry args={[matW, matH, 0.008]} />
      </mesh>
      <mesh position={[0, 0, -RECESS + 0.005]} material={printMat} receiveShadow>
        <planeGeometry args={[PRINT_W, PRINT_H]} />
      </mesh>
      <mesh position={[0, 0, -RECESS + 0.007]} material={overlayMat}>
        <planeGeometry args={[PRINT_W, PRINT_H]} />
      </mesh>
    </group>
  )
}

useTexture.preload(ART_MAP)
