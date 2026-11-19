import { useMemo, useRef } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { ROOM, useRoom } from './roomContext'

type GroupProps = ThreeElements['group']

/** Furniture layout. Coordinates are in metres; the fireplace wall is at x = -5, glazing at z = -4. */
export function Furniture() {
  return (
    <group>
      <Rug position={[-1.35, 0, -0.55]} />
      <Sofa position={[0.85, 0, -0.55]} rotation-y={-Math.PI / 2} />
      <BarrelChair position={[-3.15, 0, -1.85]} rotation-y={Math.PI / 2 - 0.55} />
      <BarrelChair position={[-3.15, 0, 0.75]} rotation-y={Math.PI / 2 + 0.55} />
      <CoffeeTable position={[-1.35, 0, -0.55]} />
      <SideTable position={[0.95, 0, 1.25]} />
      <ArcLamp position={[1.95, 0, -1.95]} rotation-y={Math.PI + 0.3} />
      <Dining position={[3.55, 0, -1.25]} />
      <Credenza position={[ROOM.maxX - 0.26, 0, 2.3]} />
      <Artwork position={[ROOM.maxX - 0.02, 1.72, 2.3]} />
      <Sculpture position={[-4.35, 0, -3.35]} />
      <BranchVessel position={[4.4, 0, -3.4]} />
    </group>
  )
}

function Rug(props: GroupProps) {
  const { lib } = useRoom()
  return (
    <group {...props}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} material={lib.rug} receiveShadow>
        <planeGeometry args={[4.6, 3.6]} />
      </mesh>
    </group>
  )
}

function Sofa(props: GroupProps) {
  const { lib, finishes } = useRoom()
  const fabric = lib.upholstery[finishes.upholstery]
  return (
    <group {...props}>
      <mesh position={[0, 0.04, 0]} material={lib.walnut} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.08, 0.92]} />
      </mesh>
      <RoundedBox args={[3.2, 0.28, 1.08]} radius={0.06} smoothness={3} position={[0, 0.22, 0]} material={fabric} castShadow receiveShadow />
      {[-0.79, 0.79].map((x) => (
        <RoundedBox key={x} args={[1.56, 0.17, 0.82]} radius={0.075} smoothness={4} position={[x, 0.44, 0.1]} material={fabric} castShadow receiveShadow />
      ))}
      <RoundedBox args={[3.2, 0.44, 0.26]} radius={0.1} smoothness={4} position={[0, 0.58, -0.41]} material={fabric} castShadow receiveShadow />
      {[-0.79, 0.79].map((x) => (
        <RoundedBox
          key={x}
          args={[1.52, 0.42, 0.22]}
          radius={0.1}
          smoothness={4}
          position={[x, 0.72, -0.24]}
          rotation-x={-0.14}
          material={fabric}
          castShadow
          receiveShadow
        />
      ))}
      <RoundedBox args={[0.5, 0.44, 0.13]} radius={0.06} smoothness={3} position={[1.25, 0.7, -0.08]} rotation={[-0.22, -0.25, 0.05]} material={lib.cushionAccent} castShadow />
      <RoundedBox args={[0.44, 0.4, 0.12]} radius={0.06} smoothness={3} position={[-1.3, 0.68, -0.07]} rotation={[-0.2, 0.3, -0.06]} material={lib.cushionAccent} castShadow />
    </group>
  )
}

function BarrelChair(props: GroupProps) {
  const { lib, finishes } = useRoom()
  const fabric = lib.upholstery[finishes.upholstery]
  const backGeometry = useMemo(() => {
    const outer = 0.46
    const inner = 0.37
    const start = THREE.MathUtils.degToRad(-35)
    const end = THREE.MathUtils.degToRad(215)
    const shape = new THREE.Shape()
    shape.absarc(0, 0, outer, start, end, false)
    shape.absarc(0, 0, inner, end, start, true)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      bevelSegments: 4,
      curveSegments: 40,
    })
    // Extrusion runs along +z; stand it up so the shell rises from the seat.
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  return (
    <group {...props}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.42, 0.1, 40]} />
        <meshStandardMaterial color="#1c1916" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0]} material={fabric} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.3, 48]} />
      </mesh>
      <RoundedBox args={[0.7, 0.13, 0.66]} radius={0.06} smoothness={4} position={[0, 0.45, 0.04]} material={fabric} castShadow receiveShadow />
      <mesh geometry={backGeometry} position={[0, 0.4, 0]} material={fabric} castShadow receiveShadow />
    </group>
  )
}

function CoffeeTable(props: GroupProps) {
  const { lib } = useRoom()
  return (
    <group {...props}>
      <mesh position={[0, 0.16, 0]} material={lib.stone} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.32, 48]} />
      </mesh>
      <mesh position={[0, 0.355, 0]} material={lib.stone} castShadow receiveShadow scale={[1.25, 1, 1]}>
        <cylinderGeometry args={[0.62, 0.62, 0.07, 64]} />
      </mesh>
      {/* Objects: book stack and a dark ceramic bowl */}
      <mesh position={[0.28, 0.42, 0.12]} rotation-y={0.3} castShadow>
        <boxGeometry args={[0.32, 0.05, 0.24]} />
        <meshStandardMaterial color="#e3d9c8" roughness={0.9} />
      </mesh>
      <mesh position={[0.28, 0.465, 0.12]} rotation-y={0.45} castShadow>
        <boxGeometry args={[0.28, 0.04, 0.21]} />
        <meshStandardMaterial color="#604a3b" roughness={0.9} />
      </mesh>
      <Vessel position={[-0.3, 0.39, -0.1]} profile="bowl" material={lib.ceramicDark} scale={0.9} />
    </group>
  )
}

function SideTable(props: GroupProps) {
  const { lib, finishes } = useRoom()
  const metal = lib.metal[finishes.metal]
  return (
    <group {...props}>
      <mesh position={[0, 0.27, 0]} material={metal} castShadow>
        <cylinderGeometry args={[0.04, 0.12, 0.52, 24]} />
      </mesh>
      <mesh position={[0, 0.54, 0]} material={lib.nero} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.03, 48]} />
      </mesh>
      <Vessel position={[0.05, 0.555, 0]} profile="bottle" material={lib.ceramic} scale={0.55} />
    </group>
  )
}

/** Brass arc lamp; its bulb and point light follow the shared lamp level. */
function ArcLamp(props: GroupProps) {
  const { lib, rig, finishes, tier } = useRoom()
  const metal = lib.metal[finishes.metal]
  const light = useRef<THREE.PointLight>(null)
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.05, 0),
        new THREE.Vector3(0, 1.3, 0),
        new THREE.Vector3(0.12, 1.95, 0),
        new THREE.Vector3(0.6, 2.28, 0),
        new THREE.Vector3(1.35, 2.22, 0),
        new THREE.Vector3(1.85, 1.92, 0),
      ]),
    [],
  )
  useFrame(() => {
    if (light.current) light.current.intensity = rig.levels.lamp * 4.5
  })
  return (
    <group {...props}>
      <mesh position={[0, 0.03, 0]} material={lib.nero} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 40]} />
      </mesh>
      <mesh material={metal} castShadow>
        <tubeGeometry args={[curve, 64, 0.014, 8, false]} />
      </mesh>
      <group position={[1.85, 1.85, 0]}>
        <mesh material={metal} castShadow>
          <sphereGeometry args={[0.24, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={rig.bulb}>
          <sphereGeometry args={[0.07, 20, 12]} />
        </mesh>
        <pointLight ref={light} position={[0, -0.12, 0]} color="#ffc68a" distance={tier === 'low' ? 4 : 6} decay={2} />
      </group>
    </group>
  )
}

function Dining(props: GroupProps) {
  const { lib, finishes, rig } = useRoom()
  const light = useRef<THREE.PointLight>(null)
  const metal = lib.metal[finishes.metal]
  useFrame(() => {
    if (light.current) light.current.intensity = rig.levels.lamp * 6
  })
  const chairs: { pos: [number, number, number]; rot: number }[] = [-0.75, 0, 0.75].flatMap((z) => [
    { pos: [-0.72, 0, z] as [number, number, number], rot: Math.PI / 2 },
    { pos: [0.72, 0, z] as [number, number, number], rot: -Math.PI / 2 },
  ])
  return (
    <group {...props}>
      <RoundedBox args={[1.0, 0.06, 2.5]} radius={0.02} smoothness={2} position={[0, 0.75, 0]} material={lib.walnut} castShadow receiveShadow />
      {[-0.75, 0.75].map((z) => (
        <mesh key={z} position={[0, 0.36, z]} material={lib.stone} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.72, 0.14]} />
        </mesh>
      ))}
      {chairs.map((c, i) => (
        <DiningChair key={i} position={c.pos} rotation-y={c.rot} />
      ))}
      <Vessel position={[0, 0.78, -0.3]} profile="bottle" material={lib.ceramic} scale={0.8} />
      <Vessel position={[0.1, 0.78, 0.25]} profile="bowl" material={lib.ceramicDark} scale={0.7} />
      {/* Linear pendant */}
      <group position={[0, 2.45, 0]}>
        <mesh material={metal} castShadow>
          <boxGeometry args={[0.07, 0.05, 1.9]} />
        </mesh>
        <mesh position={[0, -0.028, 0]} material={rig.pendant}>
          <boxGeometry args={[0.04, 0.005, 1.84]} />
        </mesh>
        {[-0.8, 0.8].map((z) => (
          <mesh key={z} position={[0, 0.47, z]} material={metal}>
            <cylinderGeometry args={[0.003, 0.003, 0.9, 6]} />
          </mesh>
        ))}
        <pointLight ref={light} position={[0, -0.25, 0]} color="#ffd29e" distance={4.5} decay={2} />
      </group>
    </group>
  )
}

function DiningChair(props: GroupProps) {
  const { lib, finishes } = useRoom()
  const fabric = lib.upholstery[finishes.upholstery]
  const metal = lib.metal[finishes.metal]
  return (
    <group {...props}>
      <RoundedBox args={[0.5, 0.09, 0.48]} radius={0.035} smoothness={3} position={[0, 0.46, 0]} material={fabric} castShadow receiveShadow />
      <RoundedBox args={[0.5, 0.4, 0.07]} radius={0.03} smoothness={3} position={[0, 0.74, -0.22]} rotation-x={-0.08} material={lib.walnut} castShadow />
      {[
        [-0.21, -0.2],
        [0.21, -0.2],
        [-0.21, 0.2],
        [0.21, 0.2],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.21, z]} material={metal} castShadow>
          <cylinderGeometry args={[0.014, 0.012, 0.42, 8]} />
        </mesh>
      ))}
    </group>
  )
}

function Credenza(props: GroupProps) {
  const { lib, finishes } = useRoom()
  const metal = lib.metal[finishes.metal]
  return (
    <group {...props}>
      <mesh position={[0, 0.05, 0]} material={lib.slatBacking}>
        <boxGeometry args={[0.4, 0.1, 2.3]} />
      </mesh>
      <mesh position={[0, 0.38, 0]} material={lib.walnut} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.56, 2.5]} />
      </mesh>
      {[-0.625, 0, 0.625].map((z) => (
        <mesh key={z} position={[-0.231, 0.38, z]} material={lib.slatBacking}>
          <boxGeometry args={[0.004, 0.5, 0.01]} />
        </mesh>
      ))}
      {[-0.95, -0.3, 0.3, 0.95].map((z) => (
        <mesh key={z} position={[-0.235, 0.5, z]} material={metal}>
          <boxGeometry args={[0.012, 0.16, 0.012]} />
        </mesh>
      ))}
      <mesh position={[0, 0.675, 0]} material={lib.nero} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.03, 2.54]} />
      </mesh>
      <Vessel position={[0, 0.69, -0.85]} profile="bottle" material={lib.ceramic} scale={1.15} />
      <Vessel position={[0.02, 0.69, -0.55]} profile="vase" material={lib.ceramicDark} scale={1} />
      <mesh position={[0, 0.72, 0.7]} rotation-y={0.2} castShadow>
        <boxGeometry args={[0.24, 0.06, 0.32]} />
        <meshStandardMaterial color="#cfc4b2" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Artwork(props: GroupProps) {
  const { lib } = useRoom()
  return (
    <group {...props}>
      <mesh position={[-0.02, 0, 0]} material={lib.walnut} castShadow>
        <boxGeometry args={[0.04, 1.12, 1.62]} />
      </mesh>
      <mesh position={[-0.042, 0, 0]} rotation-y={-Math.PI / 2} material={lib.artwork}>
        <planeGeometry args={[1.5, 1.0]} />
      </mesh>
    </group>
  )
}

function Sculpture(props: GroupProps) {
  const { lib, finishes } = useRoom()
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]} material={lib.plaster} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.9, 0.5]} />
      </mesh>
      <Vessel position={[0, 0.9, 0]} profile="amphora" material={lib.ceramicDark} scale={1.3} />
      <mesh position={[0.32, 0.12, 0.3]} material={lib.metal[finishes.metal]} castShadow>
        <sphereGeometry args={[0.12, 32, 16]} />
      </mesh>
    </group>
  )
}

/** Tall floor vessel holding a sculptural arrangement of dried branches. */
function BranchVessel(props: GroupProps) {
  const { lib } = useRoom()
  const branches = useMemo(() => {
    let seed = 11
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + rand() * 0.5
      const lean = 0.25 + rand() * 0.55
      const height = 1.1 + rand() * 0.9
      const pts = [
        new THREE.Vector3(0, 0.75, 0),
        new THREE.Vector3(Math.cos(a) * lean * 0.3, 0.75 + height * 0.45, Math.sin(a) * lean * 0.3),
        new THREE.Vector3(Math.cos(a + 0.4) * lean * 0.75, 0.75 + height * 0.8, Math.sin(a + 0.4) * lean * 0.75),
        new THREE.Vector3(Math.cos(a + 0.2) * lean, 0.75 + height, Math.sin(a + 0.2) * lean),
      ]
      return new THREE.CatmullRomCurve3(pts)
    })
  }, [])
  return (
    <group {...props}>
      <Vessel profile="amphora" material={lib.ceramicDark} scale={[1.6, 1.3, 1.6]} />
      {branches.map((curve, i) => (
        <mesh key={i} material={lib.bark} castShadow>
          <tubeGeometry args={[curve, 20, 0.008, 5, false]} />
        </mesh>
      ))}
    </group>
  )
}

const profiles: Record<'bowl' | 'bottle' | 'vase' | 'amphora', [number, number][]> = {
  bowl: [
    [0, 0],
    [0.09, 0],
    [0.15, 0.04],
    [0.17, 0.08],
    [0.16, 0.085],
    [0.13, 0.05],
    [0, 0.03],
  ],
  bottle: [
    [0, 0],
    [0.08, 0],
    [0.11, 0.08],
    [0.1, 0.2],
    [0.045, 0.28],
    [0.03, 0.36],
    [0.035, 0.38],
    [0, 0.38],
  ],
  vase: [
    [0, 0],
    [0.06, 0],
    [0.12, 0.1],
    [0.13, 0.2],
    [0.08, 0.3],
    [0.06, 0.34],
    [0, 0.34],
  ],
  amphora: [
    [0, 0],
    [0.07, 0],
    [0.16, 0.12],
    [0.19, 0.28],
    [0.14, 0.44],
    [0.07, 0.52],
    [0.06, 0.58],
    [0.08, 0.6],
    [0, 0.6],
  ],
}

function Vessel({ profile, material, ...props }: GroupProps & { profile: keyof typeof profiles; material: THREE.Material }) {
  const geometry = useMemo(() => new THREE.LatheGeometry(profiles[profile].map(([x, y]) => new THREE.Vector2(x, y)), 40), [profile])
  return (
    <group {...props}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  )
}
