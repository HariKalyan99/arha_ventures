export interface MediaAsset {
  src: string
  /** ~960px wide variant used in srcset for smaller viewports */
  srcSmall: string
  width: number
  height: number
  alt: string
  /** Origin of the file, so sample imagery can be traced and replaced */
  source: string
}

export interface NavItem {
  label: string
  to: string
}

export interface JournalEntry {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  cover: MediaAsset
  body: { heading?: string; paragraphs: string[] }[]
  sample: boolean
}

export interface SocialLink {
  label: string
  href: string
}

export interface StudioConfig {
  name: string
  legalName: string
  tagline: string
  descriptor: string
  email: string
  phone: string
  location: string
  /** WGS84 for the studio map pin */
  coordinates: { lat: number; lng: number }
  hours: string
  socials: SocialLink[]
  /** True while contact details are placeholders. Shows a visible notice in the UI. */
  contactIsPlaceholder: boolean
}

export type ProjectCategory =
  | 'Luxury Residences'
  | 'Contemporary Apartments'
  | 'Villas'
  | 'Penthouse Interiors'
  | 'Commercial Spaces'
  | 'Hospitality Interiors'

export interface ProjectMaterial {
  name: string
  application: string
  /** Swatch colour used in the material legend */
  swatch: string
}

export interface ProjectRoom {
  name: string
  note: string
  image: MediaAsset
}

export interface Project {
  slug: string
  title: string
  category: ProjectCategory
  location: string
  year: string
  area: string
  status: string
  services: string[]
  summary: string
  intro: string
  concept: { quote: string; body: string; image: MediaAsset }
  materials: ProjectMaterial[]
  rooms: ProjectRoom[]
  specifications: { label: string; value: string }[]
  gallery: MediaAsset[]
  cover: MediaAsset
  /** Secondary image used in compositions on the home page */
  detail: MediaAsset
  featured: boolean
  /** Sample content flag — rendered as a visible label until replaced */
  sample: boolean
}

export interface Service {
  id: string
  title: string
  summary: string
  scope: string[]
  image: MediaAsset
}

export interface ProcessStage {
  id: string
  title: string
  summary: string
  deliverables: string[]
  image: MediaAsset
}

export interface MaterialStory {
  id: string
  name: string
  note: string
  finishes: string
  image: MediaAsset
}

export interface Testimonial {
  id: string
  quote: string
  attribution: string
  reference: string
  sample: boolean
  /** Reviewer photo — cached from their public Google profile when available. */
  avatar?: Pick<MediaAsset, 'src' | 'alt' | 'width' | 'height'>
}

export interface InquiryConfig {
  projectTypes: string[]
  budgets: string[]
  /** Enquiry POST URL — VITE_INQUIRY_ENDPOINT or /api/inquiry */
  endpoint: string
}
