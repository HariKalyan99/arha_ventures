import type { Service } from '../types/content'
import { media } from './media'

export const services: Service[] = [
  {
    id: 'residential-construction',
    title: 'Residential Construction Works',
    summary:
      'New homes, additions and structural upgrades built with clear methodology, site discipline and finishes ready for the interior team to follow.',
    scope: ['New build', 'Renovation', 'Structure'],
    image: media['house-dusk'],
  },
  {
    id: 'commercial-construction',
    title: 'Commercial Construction Works',
    summary:
      'Retail, office and hospitality shells delivered on programme — compliant, durable and coordinated for MEP, signage and the fit-out to come.',
    scope: ['Shell & core', 'Retail', 'Offices'],
    image: media['office-open'],
  },
  {
    id: 'residential-interior',
    title: 'Residential Interior Works',
    summary:
      'Homes planned around daily rituals — joinery, finishes, lighting and furniture composed so every room feels intentional and lived-in.',
    scope: ['Joinery', 'Finishes', 'FF&E'],
    image: media['living-fireplace'],
  },
  {
    id: 'commercial-interior',
    title: 'Commercial Interior Works',
    summary:
      'Workplaces and guest-facing spaces with the comfort of a residence — zoning, acoustics and brand presence without sacrificing warmth.',
    scope: ['Workplace', 'Hospitality', 'Retail'],
    image: media.restaurant,
  },
  {
    id: 'architectural',
    title: 'Architectural Works',
    summary:
      'Plans, sections and details that reconcile structure, light and circulation before ground breaks — approvals and documentation included.',
    scope: ['Concept', 'Working drawings', 'Approvals'],
    image: media.drawing,
  },
  {
    id: 'turnkey',
    title: 'Turnkey Projects',
    summary:
      'One team from briefing through construction, interiors and handover — single point of accountability, predictable timelines, keys in hand.',
    scope: ['Design-build', 'Procurement', 'Handover'],
    image: media['living-bright'],
  },
  {
    id: 'consultation',
    title: 'Construction & Interior Consultation',
    summary:
      'Expert review of your brief, budget and drawings — feasibility, scope definition and material direction before you commit to full execution.',
    scope: ['Feasibility', 'Costing', 'Material advice'],
    image: media.meeting,
  },
  {
    id: 'villa',
    title: 'Villa Construction & Interior',
    summary:
      'Large-format living inside and out — architecture, landscaping interfaces and interiors developed together for villas and independent homes.',
    scope: ['Villa build', 'Landscape tie-in', 'Full interior'],
    image: media['villa-dusk'],
  },
  {
    id: 'apartment',
    title: 'Apartment Construction & Interior',
    summary:
      'Compact city homes made generous — reworked layouts, bespoke storage and refined finishes across apartments and penthouses.',
    scope: ['Re-planning', 'Built-ins', 'Styling'],
    image: media['living-cream'],
  },
]