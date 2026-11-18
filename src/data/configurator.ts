/** Options for the interactive 3D room. Every option here is wired to a real material or light change in the scene. */

export type FloorFinish = 'calacatta' | 'travertine' | 'oak' | 'walnut'
export type WallFinish = 'walnut-slats' | 'travertine' | 'limewash'
export type Upholstery = 'boucle' | 'cognac' | 'moss'
export type MetalFinish = 'brass' | 'bronze' | 'steel'
export type LightingMood = 'daylight' | 'evening' | 'night'
export type RoomView = 'lounge' | 'hearth' | 'dining' | 'terrace'

export interface RoomFinishes {
  floor: FloorFinish
  wall: WallFinish
  upholstery: Upholstery
  metal: MetalFinish
}

export interface Option<T extends string> {
  id: T
  label: string
  note: string
  /** CSS background used for the swatch in the UI */
  swatch: string
}

export const floorOptions: Option<FloorFinish>[] = [
  { id: 'calacatta', label: 'Calacatta marble', note: 'Honed, large-format slabs', swatch: 'linear-gradient(135deg,#efe9df 0%,#e2dbd0 45%,#b9b1a6 48%,#ece6dc 52%,#ddd5c9 100%)' },
  { id: 'travertine', label: 'Travertine', note: 'Filled and honed, warm sand', swatch: 'repeating-linear-gradient(0deg,#cdb99c 0 6px,#c3ad8e 6px 8px,#d3c1a6 8px 14px)' },
  { id: 'oak', label: 'Natural oak', note: 'Wide planks, matt oil', swatch: 'repeating-linear-gradient(90deg,#a98257 0 9px,#9a744b 9px 10px,#b08a5f 10px 20px)' },
  { id: 'walnut', label: 'American walnut', note: 'Wide planks, deep oil', swatch: 'repeating-linear-gradient(90deg,#5b3f2c 0 9px,#4c3424 9px 10px,#634634 10px 20px)' },
]

export const wallOptions: Option<WallFinish>[] = [
  { id: 'walnut-slats', label: 'Walnut slats', note: 'Fluted acoustic panelling', swatch: 'repeating-linear-gradient(90deg,#4e3626 0 5px,#2a1d15 5px 7px)' },
  { id: 'travertine', label: 'Travertine slab', note: 'Book-matched, vein-cut', swatch: 'repeating-linear-gradient(0deg,#cbb698 0 5px,#bea683 5px 7px,#d4c3a8 7px 12px)' },
  { id: 'limewash', label: 'Limewash plaster', note: 'Hand-trowelled, mineral', swatch: 'radial-gradient(circle at 30% 30%,#d9cebd,#bfb29f)' },
]

export const upholsteryOptions: Option<Upholstery>[] = [
  { id: 'boucle', label: 'Ivory bouclé', note: 'Looped wool', swatch: 'radial-gradient(circle,#ece5d8 40%,#d6cdbd 100%)' },
  { id: 'cognac', label: 'Cognac leather', note: 'Aniline, semi-matt', swatch: 'linear-gradient(135deg,#9a5a32,#6e3c1f)' },
  { id: 'moss', label: 'Moss velvet', note: 'Mohair velvet', swatch: 'linear-gradient(135deg,#5e6448,#3a3f2b)' },
]

export const metalOptions: Option<MetalFinish>[] = [
  { id: 'brass', label: 'Brushed brass', note: 'Satin, unlacquered', swatch: 'linear-gradient(135deg,#d8bf8c,#9c7f4f)' },
  { id: 'bronze', label: 'Dark bronze', note: 'Patinated', swatch: 'linear-gradient(135deg,#8a6a4a,#4a3624)' },
  { id: 'steel', label: 'Blackened steel', note: 'Waxed', swatch: 'linear-gradient(135deg,#55534f,#232220)' },
]

export const moodOptions: { id: LightingMood; label: string; note: string }[] = [
  { id: 'daylight', label: 'Daylight', note: 'High sun, open glazing' },
  { id: 'evening', label: 'Golden evening', note: 'Low sun, first lamps' },
  { id: 'night', label: 'Ambient night', note: 'Fire, cove and lamp light' },
]

export const viewOptions: { id: RoomView; label: string }[] = [
  { id: 'lounge', label: 'Lounge' },
  { id: 'hearth', label: 'Hearth' },
  { id: 'dining', label: 'Dining' },
  { id: 'terrace', label: 'Terrace view' },
]

export const defaultFinishes: RoomFinishes = {
  floor: 'calacatta',
  wall: 'walnut-slats',
  upholstery: 'boucle',
  metal: 'brass',
}
