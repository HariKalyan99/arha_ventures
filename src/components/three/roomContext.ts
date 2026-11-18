import { createContext, useContext } from 'react'
import type { RoomFinishes } from '../../data/configurator'
import type { QualityTier } from '../../lib/device'
import type { MaterialLibrary } from './materials'
import type { SceneRig } from './rig'

export interface RoomContextValue {
  lib: MaterialLibrary
  rig: SceneRig
  finishes: RoomFinishes
  tier: QualityTier
}

export const RoomContext = createContext<RoomContextValue | null>(null)

export function useRoom() {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error('useRoom must be used inside <RoomScene>')
  return ctx
}

/** Room dimensions in metres. The camera side (positive z) is open. */
export const ROOM = {
  minX: -5,
  maxX: 5,
  backZ: -4,
  frontZ: 5,
  height: 3.4,
  glazingStartX: -3.4,
} as const
