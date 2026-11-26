import * as THREE from 'three'

/**
 * Architectural GLBs often include a huge empty shell AABB.
 * Prefer the dense “core” of mesh volume for standing cameras / fit.
 */
export function contentBox(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  const full = new THREE.Box3().setFromObject(root)
  if (full.isEmpty()) return full

  const fullSize = full.getSize(new THREE.Vector3())
  const fullVol = Math.max(fullSize.x * fullSize.y * fullSize.z, 1e-6)

  const meshes: { center: THREE.Vector3; box: THREE.Box3; vol: number }[] = []
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.visible) return
    const box = new THREE.Box3().setFromObject(obj)
    if (box.isEmpty()) return
    const size = box.getSize(new THREE.Vector3())
    const vol = size.x * size.y * size.z
    /* Skip the giant outer shell that only inflates the AABB. */
    if (vol > fullVol * 0.4) return
    if (vol < 1e-6) return
    meshes.push({ center: box.getCenter(new THREE.Vector3()), box, vol })
  })

  if (meshes.length === 0) return full

  let tw = 0
  let cx = 0
  let cy = 0
  let cz = 0
  for (const m of meshes) {
    tw += m.vol
    cx += m.center.x * m.vol
    cy += m.center.y * m.vol
    cz += m.center.z * m.vol
  }
  cx /= tw
  cy /= tw
  cz /= tw

  const core = new THREE.Box3()
  const radius = Math.max(fullSize.x, fullSize.z) * 0.28
  for (const m of meshes) {
    const d = Math.hypot(m.center.x - cx, m.center.z - cz)
    if (d > Math.max(radius, 8)) continue
    core.union(m.box)
  }

  return core.isEmpty() ? full : core
}
