import type { MaterialStory } from '../types/content'
import { media } from './media'

export const materialStories: MaterialStory[] = [
  {
    id: 'marble',
    name: 'Marble',
    note: 'Book-matched slabs chosen at the quarry yard, so veining flows across a room as one composition.',
    finishes: 'Honed · Leathered · Polished',
    image: media['marble-black'],
  },
  {
    id: 'stone',
    name: 'Natural Stone',
    note: 'Limestone, travertine and basalt — selected for how they hold light and how gracefully they age.',
    finishes: 'Split-face · Honed · Brushed',
    image: media['bath-stone'],
  },
  {
    id: 'wood',
    name: 'Wood',
    note: 'Walnut, oak and ash from certified sources, oiled rather than lacquered so the grain stays alive.',
    finishes: 'Oiled · Fumed · Smoked',
    image: media['wood-dark'],
  },
  {
    id: 'metal',
    name: 'Metal Finishes',
    note: 'Brass, bronze and blackened steel, left to patinate where hands touch them most.',
    finishes: 'Brushed · Patinated · Blackened',
    image: media['brass-pendants'],
  },
  {
    id: 'fabric',
    name: 'Fabrics',
    note: 'Bouclé, linen, wool and mohair velvet — layered for depth, chosen for touch before colour.',
    finishes: 'Woven · Felted · Knotted',
    image: media['textile-rug'],
  },
  {
    id: 'lighting',
    name: 'Lighting',
    note: 'Light is designed as architecture: concealed lines, low pools and a few fittings worth looking at.',
    finishes: 'Indirect · Ambient · Accent',
    image: media['facade-night'],
  },
  {
    id: 'furniture',
    name: 'Custom Furniture',
    note: 'Pieces drawn for the room they live in, made by workshops we have visited and trust.',
    finishes: 'Joinery · Upholstery · Casegoods',
    image: media['vessels'],
  },
]
