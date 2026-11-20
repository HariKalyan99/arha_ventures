import type { Project, ProjectCategory } from '../types/content'
import { media } from './media'

/**
 * SAMPLE PORTFOLIO — every project below is illustrative content created to
 * demonstrate the layouts. Titles, locations, years, areas and descriptions are
 * not real commissions. Replace with the studio's own projects before launch
 * (set `sample: false` once a project is real).
 */
export const projects: Project[] = [
  {
    slug: 'the-stone-pavilion',
    title: 'The Stone Pavilion',
    category: 'Villas',
    location: 'Coastal hillside',
    year: '2025',
    area: '640 m²',
    status: 'Completed',
    services: ['Architecture', 'Interior design', 'Landscape coordination'],
    summary: 'A low villa of honed limestone and glass, set into the slope so that every room faces the horizon.',
    intro:
      'The brief asked for a house that would disappear into its site by day and glow quietly at night. We answered with a single horizontal datum: a stone plinth carrying a floating roof, with the living spaces held in the shadow between them.',
    concept: {
      quote: 'Weight below, lightness above — the house is a threshold between the hill and the sea.',
      body: 'Walls are drawn from one honed limestone, used inside and out so the boundary between terrace and room becomes a question of temperature rather than material. Glazing slides fully away along the south façade, turning the living hall into a covered terrace for most of the year.',
      image: media['living-wood-stone'],
    },
    materials: [
      { name: 'Honed limestone', application: 'Walls, floors, terrace', swatch: '#cbbfa9' },
      { name: 'Smoked oak', application: 'Ceilings and joinery', swatch: '#6b513b' },
      { name: 'Bronze', application: 'Window frames and fixtures', swatch: '#604a3b' },
      { name: 'Raw linen', application: 'Upholstery and drapery', swatch: '#d9cfbf' },
    ],
    rooms: [
      { name: 'Living hall', note: 'A full-height stone wall anchors low seating oriented towards the view.', image: media['living-stone'] },
      { name: 'Bathing room', note: 'A freestanding bath set against split-face stone, lit from a concealed skylight.', image: media['bath-stone'] },
      { name: 'Pool terrace', note: 'The pool edge aligns with the interior floor so the plinth reads as one plane.', image: media['pool-night'] },
    ],
    specifications: [
      { label: 'Interior area', value: '640 m²' },
      { label: 'Bedrooms', value: '5 suites' },
      { label: 'Scope', value: 'Architecture, interiors, lighting' },
      { label: 'Programme', value: '26 months' },
    ],
    gallery: [media['stone-texture'], media['living-pool-view']],
    cover: media['villa-dusk'],
    detail: media['bath-stone'],
    featured: true,
    sample: true,
  },
  {
    slug: 'obsidian-penthouse',
    title: 'Obsidian Penthouse',
    category: 'Penthouse Interiors',
    location: 'City centre, upper floors',
    year: '2024',
    area: '410 m²',
    status: 'Completed',
    services: ['Interior architecture', 'Furniture design', 'Art curation'],
    summary: 'A dark, quiet residence above the city, where walnut, Nero marble and smoked glass absorb the skyline.',
    intro:
      'Most penthouses compete with their view. This one frames it. We lowered the palette to near-black so that the city becomes the brightest material in every room, and reserved light for the moments that matter: the table, the stair, the bath.',
    concept: {
      quote: 'A dark room is not a gloomy one — it is a room that lets the outside perform.',
      body: 'A floating glass stair connects the two levels without interrupting sightlines. Walnut panelling runs continuously from hall to salon, concealing storage, doors and a bar, so that the architecture reads as a single carved volume.',
      image: media['stair-view'],
    },
    materials: [
      { name: 'Nero Marquina marble', application: 'Bath and kitchen surfaces', swatch: '#1d1c1b' },
      { name: 'American walnut', application: 'Wall panelling and joinery', swatch: '#5a3f2e' },
      { name: 'Smoked glass', application: 'Balustrades and partitions', swatch: '#3b3a37' },
      { name: 'Brushed brass', application: 'Lighting and hardware', swatch: '#b69b75' },
    ],
    rooms: [
      { name: 'Dining', note: 'A twelve-seat table sits beneath the stair, lit by a single linear pendant.', image: media['dining-stair'] },
      { name: 'Principal suite', note: 'Charcoal plaster walls and wool drapery create a softly acoustic retreat.', image: media['bedroom-dark'] },
      { name: 'Bath', note: 'A sculptural tub faces the skyline behind a privacy-tinted window.', image: media['bath-dark'] },
    ],
    specifications: [
      { label: 'Interior area', value: '410 m²' },
      { label: 'Levels', value: '2' },
      { label: 'Scope', value: 'Interior architecture, FF&E' },
      { label: 'Programme', value: '14 months' },
    ],
    gallery: [media['marble-black'], media['brass-pendants']],
    cover: media['living-walnut-wall'],
    detail: media['bedroom-dark'],
    featured: true,
    sample: true,
  },
  {
    slug: 'walnut-house',
    title: 'Walnut House',
    category: 'Luxury Residences',
    location: 'Woodland edge',
    year: '2024',
    area: '520 m²',
    status: 'Completed',
    services: ['Architecture', 'Interior design', 'Bespoke joinery'],
    summary: 'A family residence wrapped in timber screens, designed around a hearth and the changing light of the trees.',
    intro:
      'The family wanted warmth without ornament. The house is organised around a central hearth, with every principal room borrowing its glow. Vertical walnut screens filter the woodland light and give the façade its quiet rhythm.',
    concept: {
      quote: 'Timber is the most forgiving material we know. It ages with the people who live with it.',
      body: 'Joinery was developed with the workshop from the first sketch, so storage, seating and lighting are integrated rather than added. The same walnut appears in the screens, the media wall and the bed frames, tying the house together.',
      image: media['wood-dark'],
    },
    materials: [
      { name: 'Oiled walnut', application: 'Screens, media wall, joinery', swatch: '#5b3f2c' },
      { name: 'Travertine', application: 'Hearth and bathrooms', swatch: '#cdb99c' },
      { name: 'Lime plaster', application: 'Walls and ceilings', swatch: '#ddd3c3' },
      { name: 'Wool bouclé', application: 'Upholstery', swatch: '#e2dbcf' },
    ],
    rooms: [
      { name: 'Family room', note: 'A timber-clad media wall conceals storage around a linear fire.', image: media['living-timber'] },
      { name: 'Hearth', note: 'Stone, glass and a double-height ceiling around the heart of the house.', image: media['living-fireplace'] },
      { name: 'Principal bath', note: 'Timber slats, stone vanity and an indirect light line at the mirror.', image: media['bath-slats'] },
      { name: 'Bedroom', note: 'A solid timber bed frame grounded on a pale linen palette.', image: media['bedroom-timber'] },
    ],
    specifications: [
      { label: 'Interior area', value: '520 m²' },
      { label: 'Bedrooms', value: '4' },
      { label: 'Scope', value: 'Architecture, interiors, joinery' },
      { label: 'Programme', value: '22 months' },
    ],
    gallery: [media['living-modern']],
    cover: media['house-dusk'],
    detail: media['living-timber'],
    featured: true,
    sample: true,
  },
  {
    slug: 'atelier-apartment',
    title: 'Atelier Apartment',
    category: 'Contemporary Apartments',
    location: 'Historic quarter',
    year: '2023',
    area: '186 m²',
    status: 'Completed',
    services: ['Interior design', 'Space planning', 'Styling'],
    summary: 'An apartment in a former atelier, softened with curved forms, sand tones and a single marble kitchen.',
    intro:
      'Tall windows and a generous ceiling were the inheritance; everything else was reconsidered. We removed a corridor to create one flowing living space and introduced curves to slow the eye down.',
    concept: {
      quote: 'Curves are a kindness in a small plan — they guide you rather than stop you.',
      body: 'A restrained palette of sand, cream and raw timber lets the original light do the work. The kitchen is a single book-matched marble composition that doubles as the apartment’s only statement.',
      image: media['living-cream'],
    },
    materials: [
      { name: 'Calacatta marble', application: 'Kitchen', swatch: '#e9e3d8' },
      { name: 'Natural oak', application: 'Floors', swatch: '#a98257' },
      { name: 'Sand plaster', application: 'Walls', swatch: '#d8c8b0' },
      { name: 'Bouclé', application: 'Seating', swatch: '#e6dfd2' },
    ],
    rooms: [
      { name: 'Living', note: 'Curved seating gathers around a low travertine table.', image: media['living-curves'] },
      { name: 'Kitchen', note: 'One continuous marble splashback with concealed appliances.', image: media['kitchen-marble'] },
      { name: 'Bedroom', note: 'A darker accent wall and a sculptural chandelier for evening.', image: media['bedroom-chandelier'] },
    ],
    specifications: [
      { label: 'Interior area', value: '186 m²' },
      { label: 'Bedrooms', value: '2' },
      { label: 'Scope', value: 'Interiors, planning, styling' },
      { label: 'Programme', value: '9 months' },
    ],
    gallery: [media['pendants-living'], media['vessels']],
    cover: media['living-warm'],
    detail: media['living-curves'],
    featured: false,
    sample: true,
  },
  {
    slug: 'hotel-solenne',
    title: 'Hotel Solenne',
    category: 'Hospitality Interiors',
    location: 'Seafront',
    year: '2026',
    area: '4,800 m²',
    status: 'In progress',
    services: ['Interior architecture', 'FF&E', 'Lighting design'],
    summary: 'A boutique hotel of courtyards and dark timber, designed for long evenings rather than quick stays.',
    intro:
      'Solenne is planned around three courtyards, each with its own mood. Guest rooms are deliberately calm, while public spaces gather around water, low light and warm timber.',
    concept: {
      quote: 'Hospitality is choreography: the sequence matters more than any single room.',
      body: 'We designed the arrival as a slow reveal — from a shaded entrance, through a reflecting courtyard, to a restaurant that only opens to the sea at the last moment.',
      image: media['restaurant'],
    },
    materials: [
      { name: 'Dark-stained oak', application: 'Panelling and casegoods', swatch: '#3e2e23' },
      { name: 'Local limestone', application: 'Courtyards and baths', swatch: '#c9b99e' },
      { name: 'Hand-woven wool', application: 'Rugs and headboards', swatch: '#8d7a66' },
      { name: 'Aged brass', application: 'Lighting and bar', swatch: '#b69b75' },
    ],
    rooms: [
      { name: 'Suites', note: 'Dark timber panelling with soft, low bedside light.', image: media['hotel-suite'] },
      { name: 'Guest rooms', note: 'Tailored, quiet and generous in storage.', image: media['hotel-room'] },
      { name: 'Restaurant', note: 'Low pendants and dark timber for long dinners.', image: media['restaurant'] },
      { name: 'Pool pavilion', note: 'The evening destination, lit only from below.', image: media['resort-pool'] },
    ],
    specifications: [
      { label: 'Interior area', value: '4,800 m²' },
      { label: 'Keys', value: '42' },
      { label: 'Scope', value: 'Interiors, FF&E, lighting' },
      { label: 'Status', value: 'In progress' },
    ],
    gallery: [media['lounge-chairs']],
    cover: media['hotel-dusk'],
    detail: media['hotel-suite'],
    featured: true,
    sample: true,
  },
  {
    slug: 'meridian-workplace',
    title: 'Meridian Workplace',
    category: 'Commercial Spaces',
    location: 'Business district',
    year: '2023',
    area: '2,100 m²',
    status: 'Completed',
    services: ['Workplace strategy', 'Interior architecture', 'Furniture'],
    summary: 'A headquarters that behaves like a private club: concrete, glass and warm lounges between focused studios.',
    intro:
      'The client wanted a workplace people would choose over working from home. We stripped the floorplate back to its concrete frame and introduced warm, residential lounges between open studio floors.',
    concept: {
      quote: 'A good workplace has the confidence to be quiet.',
      body: 'Acoustic timber, deep upholstery and adjustable lighting create a series of settings for different kinds of work, connected by a continuous polished concrete floor.',
      image: media['office-studio'],
    },
    materials: [
      { name: 'Polished concrete', application: 'Floors', swatch: '#8f8a84' },
      { name: 'Smoked oak', application: 'Acoustic panels', swatch: '#6b513b' },
      { name: 'Blackened steel', application: 'Frames and shelving', swatch: '#2c2b29' },
      { name: 'Leather', application: 'Lounge seating', swatch: '#7a4e32' },
    ],
    rooms: [
      { name: 'Reception', note: 'A pared-back arrival with a single stone desk.', image: media['office-open'] },
      { name: 'Lounge', note: 'Residential seating against original brick.', image: media['loft-lounge'] },
      { name: 'Studio floor', note: 'Open benching beneath exposed services.', image: media['office-studio'] },
    ],
    specifications: [
      { label: 'Interior area', value: '2,100 m²' },
      { label: 'Workstations', value: '160' },
      { label: 'Scope', value: 'Strategy, interiors, furniture' },
      { label: 'Programme', value: '11 months' },
    ],
    gallery: [media['lounge-chairs']],
    cover: media['office-glass'],
    detail: media['loft-lounge'],
    featured: true,
    sample: true,
  },
  {
    slug: 'courtyard-house',
    title: 'Courtyard House',
    category: 'Luxury Residences',
    location: 'Garden suburb',
    year: '2022',
    area: '380 m²',
    status: 'Completed',
    services: ['Architecture', 'Interior design'],
    summary: 'A compact house turned inwards to a planted court and a long, dark pool.',
    intro:
      'On a narrow plot, privacy and light were in tension. We turned the plan inwards so that every room opens to a planted courtyard and a lap pool, leaving the street façade almost silent.',
    concept: {
      quote: 'When you cannot have a view, make one.',
      body: 'Tall glazing and pale floors bounce courtyard light deep into the plan. At night, vertical slots in the façade become the house’s only public expression.',
      image: media['living-pool-view'],
    },
    materials: [
      { name: 'Pale terrazzo', application: 'Floors', swatch: '#d6cdbf' },
      { name: 'Fluted render', application: 'Façade', swatch: '#bfb4a4' },
      { name: 'Teak', application: 'Courtyard decking', swatch: '#8a6646' },
    ],
    rooms: [
      { name: 'Garden room', note: 'A single lounge chair facing the planted court.', image: media['living-garden-view'] },
      { name: 'Pool court', note: 'A narrow lap pool lit from below.', image: media['pool-portrait'] },
      { name: 'Bath', note: 'A floating vanity with a private garden view.', image: media['bath-vanity'] },
    ],
    specifications: [
      { label: 'Interior area', value: '380 m²' },
      { label: 'Bedrooms', value: '3' },
      { label: 'Scope', value: 'Architecture, interiors' },
      { label: 'Programme', value: '18 months' },
    ],
    gallery: [media['textile-rug']],
    cover: media['facade-night'],
    detail: media['living-garden-view'],
    featured: false,
    sample: true,
  },
  {
    slug: 'villa-lumen',
    title: 'Villa Lumen',
    category: 'Villas',
    location: 'Hill country',
    year: '2025',
    area: '720 m²',
    status: 'Completed',
    services: ['Interior design', 'Lighting design', 'Furniture'],
    summary: 'A white villa interior warmed with exposed beams, arched openings and layers of natural linen.',
    intro:
      'The architecture was crisp and bright; our role was to give it a slower, softer interior. Exposed timber beams and deep window reveals bring weight to rooms otherwise defined by light.',
    concept: {
      quote: 'Brightness needs a counterweight. Here it is timber.',
      body: 'Furniture was kept low and loose so that the arched openings remain the dominant gesture. Lighting is entirely indirect after dusk.',
      image: media['living-bright'],
    },
    materials: [
      { name: 'Reclaimed oak', application: 'Beams and floors', swatch: '#8b6a4b' },
      { name: 'Lime wash', application: 'Walls', swatch: '#e6ddd0' },
      { name: 'Natural linen', application: 'Upholstery and curtains', swatch: '#d4c8b4' },
    ],
    rooms: [
      { name: 'Great room', note: 'Exposed beams over a low, loosely arranged lounge.', image: media['living-beams'] },
      { name: 'Guest suite', note: 'Layered neutrals and a view to the garden.', image: media['bedroom-calm'] },
      { name: 'Sitting room', note: 'A modern fireplace in a quiet corner of the plan.', image: media['living-modern'] },
    ],
    specifications: [
      { label: 'Interior area', value: '720 m²' },
      { label: 'Bedrooms', value: '6' },
      { label: 'Scope', value: 'Interiors, lighting, furniture' },
      { label: 'Programme', value: '15 months' },
    ],
    gallery: [media['living-bright']],
    cover: media['villa-white'],
    detail: media['living-beams'],
    featured: false,
    sample: true,
  },
]

export const featuredProjects = projects.filter((p) => p.featured)

export const projectCategories: ProjectCategory[] = Array.from(new Set(projects.map((p) => p.category)))

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}

export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug)
  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  return { prev, next }
}
