import * as THREE from 'three'
import type { FloorFinish, MetalFinish, Upholstery, WallFinish } from '../../data/configurator'
import { getTexture } from './textures'

export interface MaterialLibrary {
  floor: Record<FloorFinish, THREE.MeshStandardMaterial>
  wall: Record<WallFinish, THREE.MeshStandardMaterial>
  slatBacking: THREE.MeshStandardMaterial
  upholstery: Record<Upholstery, THREE.MeshPhysicalMaterial>
  metal: Record<MetalFinish, THREE.MeshStandardMaterial>
  plaster: THREE.MeshStandardMaterial
  ceiling: THREE.MeshStandardMaterial
  walnut: THREE.MeshStandardMaterial
  oak: THREE.MeshStandardMaterial
  stone: THREE.MeshStandardMaterial
  nero: THREE.MeshStandardMaterial
  rug: THREE.MeshStandardMaterial
  terrace: THREE.MeshStandardMaterial
  glass: THREE.MeshPhysicalMaterial
  frame: THREE.MeshStandardMaterial
  artwork: THREE.MeshStandardMaterial
  ceramic: THREE.MeshStandardMaterial
  ceramicDark: THREE.MeshStandardMaterial
  foliage: THREE.MeshStandardMaterial
  bark: THREE.MeshStandardMaterial
  firebox: THREE.MeshStandardMaterial
  cushionAccent: THREE.MeshStandardMaterial
}

const libraries = new Map<number, MaterialLibrary>()

function std(params: THREE.MeshStandardMaterialParameters) {
  const m = new THREE.MeshStandardMaterial(params)
  // Thin architectural planes must block the sun from both sides.
  m.shadowSide = THREE.DoubleSide
  return m
}

/** Builds (once per texture resolution) every material the room can display. */
export function getMaterialLibrary(size: number): MaterialLibrary {
  const cached = libraries.get(size)
  if (cached) return cached

  const half = Math.max(256, size / 2)
  const t = getTexture

  const lib: MaterialLibrary = {
    floor: {
      calacatta: std({ map: t('calacatta', size, [4, 3.75]), roughness: 0.22, metalness: 0, bumpMap: t('calacatta', size, [4, 3.75]), bumpScale: 0.3 }),
      travertine: std({ map: t('travertine', size, [5, 4.5]), roughness: 0.6, bumpMap: t('travertine', size, [5, 4.5]), bumpScale: 1.4 }),
      limestone: std({ map: t('limestone', size, [5, 4.5]), roughness: 0.55, bumpMap: t('limestone', size, [5, 4.5]), bumpScale: 0.9 }),
      nero: std({ map: t('nero', size, [4, 3.75]), roughness: 0.18, metalness: 0.05, bumpMap: t('nero', size, [4, 3.75]), bumpScale: 0.25 }),
      oak: std({ map: t('oak', size, [5.5, 5]), roughness: 0.5, bumpMap: t('oak', size, [5.5, 5]), bumpScale: 0.6 }),
      'smoked-oak': std({ map: t('smokedOak', size, [5.5, 5]), roughness: 0.48, bumpMap: t('smokedOak', size, [5.5, 5]), bumpScale: 0.6 }),
      walnut: std({ map: t('walnut', size, [5.5, 5]), roughness: 0.42, bumpMap: t('walnut', size, [5.5, 5]), bumpScale: 0.6 }),
    },
    wall: {
      'walnut-slats': std({ map: t('walnutGrain', half, [0.12, 1.6]), roughness: 0.55 }),
      'oak-slats': std({ map: t('oakGrain', half, [0.12, 1.6]), roughness: 0.58 }),
      travertine: std({ map: t('travertine', size, [4.5, 1.7]), roughness: 0.62, bumpMap: t('travertine', size, [4.5, 1.7]), bumpScale: 1.6 }),
      limewash: std({ map: t('limewash', size, [3, 1.15]), roughness: 0.95, bumpMap: t('limewash', size, [3, 1.15]), bumpScale: 1.2 }),
      plaster: std({ map: t('plaster', size, [3, 1.15]), roughness: 0.92, bumpMap: t('plaster', size, [3, 1.15]), bumpScale: 0.8 }),
      nero: std({ map: t('nero', size, [3.5, 1.4]), roughness: 0.2, metalness: 0.05, bumpMap: t('nero', size, [3.5, 1.4]), bumpScale: 0.3 }),
    },
    slatBacking: std({ color: '#1a1410', roughness: 0.9 }),
    upholstery: {
      boucle: new THREE.MeshPhysicalMaterial({
        map: t('boucle', half, [3, 3]),
        bumpMap: t('boucle', half, [3, 3]),
        bumpScale: 2.2,
        roughness: 0.96,
        sheen: 0.4,
        sheenColor: new THREE.Color('#ffffff'),
        sheenRoughness: 0.8,
      }),
      linen: new THREE.MeshPhysicalMaterial({
        map: t('linen', half, [3, 3]),
        bumpMap: t('linen', half, [3, 3]),
        bumpScale: 1.1,
        roughness: 0.92,
        sheen: 0.2,
        sheenColor: new THREE.Color('#f0e6d4'),
        sheenRoughness: 0.85,
      }),
      cognac: new THREE.MeshPhysicalMaterial({
        map: t('leather', half, [2, 2]),
        bumpMap: t('leather', half, [2, 2]),
        bumpScale: 0.6,
        roughness: 0.42,
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
      }),
      moss: new THREE.MeshPhysicalMaterial({
        map: t('velvet', half, [2, 2]),
        roughness: 0.82,
        sheen: 1,
        sheenColor: new THREE.Color('#b7bf98'),
        sheenRoughness: 0.35,
      }),
      charcoal: new THREE.MeshPhysicalMaterial({
        map: t('charcoalWool', half, [2.5, 2.5]),
        bumpMap: t('charcoalWool', half, [2.5, 2.5]),
        bumpScale: 1.4,
        roughness: 0.94,
        sheen: 0.25,
        sheenColor: new THREE.Color('#8a8680'),
        sheenRoughness: 0.75,
      }),
      ink: new THREE.MeshPhysicalMaterial({
        map: t('inkVelvet', half, [2, 2]),
        roughness: 0.78,
        sheen: 1,
        sheenColor: new THREE.Color('#6a7a9a'),
        sheenRoughness: 0.32,
      }),
    },
    metal: {
      brass: std({ color: '#c9a86a', metalness: 1, roughness: 0.3 }),
      bronze: std({ color: '#7a5a3c', metalness: 1, roughness: 0.42 }),
      copper: std({ color: '#b8734d', metalness: 1, roughness: 0.35 }),
      nickel: std({ color: '#b0aea8', metalness: 1, roughness: 0.28 }),
      steel: std({ color: '#3a3936', metalness: 0.85, roughness: 0.48 }),
    },
    plaster: std({ map: t('plaster', half, [3, 1.2]), roughness: 0.95 }),
    ceiling: std({ color: '#d3c9b9', roughness: 1 }),
    walnut: std({ map: t('walnutGrain', half, [1, 1]), roughness: 0.5 }),
    oak: std({ map: t('oakGrain', half, [1, 1]), roughness: 0.55 }),
    stone: std({ map: t('travertine', half, [1, 1]), roughness: 0.6, bumpMap: t('travertine', half, [1, 1]), bumpScale: 1 }),
    nero: std({ map: t('nero', half, [1, 1]), roughness: 0.18 }),
    rug: std({ map: t('rug', size, [1, 1]), roughness: 1, bumpMap: t('rug', size, [1, 1]), bumpScale: 1.5 }),
    terrace: std({ map: t('terrace', half, [6, 3]), roughness: 0.85 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#c8d0cc',
      transparent: true,
      opacity: 0.1,
      roughness: 0.04,
      metalness: 0,
      envMapIntensity: 2.2,
      depthWrite: false,
    }),
    frame: std({ color: '#1c1916', metalness: 0.6, roughness: 0.45 }),
    artwork: std({ map: t('artwork', half, [1, 1]), roughness: 0.9 }),
    ceramic: std({ color: '#d9cfbf', roughness: 0.55 }),
    ceramicDark: std({ color: '#2e2925', roughness: 0.45 }),
    foliage: std({ color: '#4a5236', roughness: 0.85 }),
    bark: std({ color: '#3d3128', roughness: 0.9 }),
    firebox: std({ color: '#0d0c0b', roughness: 0.95 }),
    cushionAccent: std({ color: '#604b3b', roughness: 0.9 }),
  }

  libraries.set(size, lib)
  return lib
}
