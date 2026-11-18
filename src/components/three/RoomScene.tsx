import { useEffect, useMemo } from 'react'
import { ContactShadows } from '@react-three/drei'
import type { LightingMood, RoomFinishes } from '../../data/configurator'
import { tierSettings, type QualityTier } from '../../lib/device'
import { Architecture } from './Architecture'
import { Furniture } from './Furniture'
import { Lighting, type MoodBlend } from './Lighting'
import { getMaterialLibrary } from './materials'
import { createRig, disposeRig } from './rig'
import { RoomContext } from './roomContext'

interface RoomSceneProps {
  finishes: RoomFinishes
  mood: LightingMood
  blend?: MoodBlend
  tier: QualityTier
}

/** The living room shared by the hero and the interactive atelier. */
export function RoomScene({ finishes, mood, blend, tier }: RoomSceneProps) {
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
      {/* Soft contact occlusion under furniture, rendered once since the layout is static */}
      <ContactShadows position={[0, 0.009, 0.5]} scale={[10, 9]} far={1.2} blur={2.6} opacity={0.55} resolution={tier === 'low' ? 512 : 1024} frames={1} color="#140d08" />
    </RoomContext.Provider>
  )
}
