import type { Service } from '../types/content'
import { media } from './media'

export const services: Service[] = [
  {
    id: 'residential',
    title: 'Residential Interior Design',
    summary: 'Complete interiors for private homes — from the first plan to the last cushion — composed around how you actually live.',
    scope: ['Concept', 'Detailing', 'Furniture', 'Art'],
    image: media['living-fireplace'],
  },
  {
    id: 'villas',
    title: 'Luxury Villa Design',
    summary: 'Architecture and interiors conceived together, so landscape, structure and rooms speak a single language.',
    scope: ['Architecture', 'Interiors', 'Landscape'],
    image: media['villa-dusk'],
  },
  {
    id: 'apartments',
    title: 'Apartment Interiors',
    summary: 'Re-planning and refining city apartments and penthouses to feel generous, calm and entirely personal.',
    scope: ['Re-planning', 'Joinery', 'Styling'],
    image: media['living-cream'],
  },
  {
    id: 'commercial',
    title: 'Commercial Interiors',
    summary: 'Workplaces, hospitality and retail spaces with the material quality and comfort of a private residence.',
    scope: ['Workplace', 'Hospitality', 'Retail'],
    image: media['restaurant'],
  },
  {
    id: 'planning',
    title: 'Space Planning',
    summary: 'Measured layouts that resolve circulation, light and storage before a single finish is chosen.',
    scope: ['Surveys', 'Layouts', 'Zoning'],
    image: media['drawing'],
  },
  {
    id: 'styling',
    title: 'Furniture & Styling',
    summary: 'Bespoke and sourced pieces, art and objects — curated so each room feels collected over time.',
    scope: ['Bespoke', 'Sourcing', 'Art curation'],
    image: media['lounge-chairs'],
  },
  {
    id: 'materials',
    title: 'Material Consultation',
    summary: 'Stone, timber, metal and textile palettes selected in person and tested against light, use and age.',
    scope: ['Stone', 'Timber', 'Finishes'],
    image: media['marble-black'],
  },
  {
    id: 'turnkey',
    title: 'Turnkey Interior Solutions',
    summary: 'One accountable team from concept through procurement, installation and handover — keys in hand.',
    scope: ['Procurement', 'Site', 'Handover'],
    image: media['living-wood-stone'],
  },
]
