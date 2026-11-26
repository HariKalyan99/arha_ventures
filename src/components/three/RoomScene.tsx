import { useEffect, useMemo } from 'react'
import { ContactShadows } from '@react-three/drei'
import type { LightingMood, RoomFinishes } from '../../data/configurator'
import { tierSettings, type QualityTier } from '../../lib/device'
import { Architecture } from './Architecture'
import { Furniture } from './Furniture'
import { Lighting, type MoodBlend } from './Lighting'
import { LivingRoomModel } from './LivingRoomModel'
import { ModelLighting } from './ModelLighting'
import { getMaterialLibrary } from './materials'
import { createRig, disposeRig } from './rig'
import { RoomContext } from './roomContext'
import { HERO_ROOM_SOURCE, type RoomSource } from './roomSource'

interface RoomSceneProps {
  finishes: RoomFinishes
  mood: LightingMood
  blend?: MoodBlend
  tier: QualityTier
  /** Override which room to render. Defaults to the hero (GLB) source. */
  source?: RoomSource
  /** Site Night theme — black aesthetics + sheen on the GLB loft */
  noir?: boolean
}

/** Living room for hero (GLB tour) or atelier (procedural finishes). */
export function RoomScene({ finishes, mood, blend, tier, source = HERO_ROOM_SOURCE, noir = false }: RoomSceneProps) {
  if (source === 'glb') {
    return (
      <>
        <ModelLighting mood={mood} blend={blend} noir={noir} />
        <LivingRoomModel noir={noir} />
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={16}
          far={2.4}
          blur={noir ? 3.2 : 2.6}
          opacity={noir ? 0.55 : 0.36}
          resolution={512}
          frames={1}
          color={noir ? '#020204' : '#1a120c'}
        />
      </>
    )
  }

  return <ProceduralRoom finishes={finishes} mood={mood} blend={blend} tier={tier} />
}

/** Hand-built room — used by the atelier so material / lighting configs apply. */
function ProceduralRoom({ finishes, mood, blend, tier }: Omit<RoomSceneProps, 'source'>) {
  const textureSize = tierSettings[tier].textureSize
  const lib = useMemo(() => getMaterialLibrary(textureSize), [textureSize])
  const rig = useMemo(() => createRig(), [])
  useEffect(() => () => disposeRig(rig), [rig])

  const value = useMemo(() => ({ lib, rig, finishes, tier }), [lib, rig, finishes, tier])

  return (
    <RoomContext.Provider value={value}>
      <Lighting mood={mood} blend={blend} />
      <Architecture />
      <Furniture />
      <ContactShadows
        position={[0, 0.009, 0.5]}
        scale={[10, 9]}
        far={1.2}
        blur={2.4}
        opacity={0.55}
        resolution={tier === 'low' ? 512 : 1024}
        frames={1}
        color="#140d08"
      />
    </RoomContext.Provider>
  )
}
