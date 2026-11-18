import type { InquiryConfig, NavItem, StudioConfig } from '../types/content'

/**
 * Studio identity and contact details.
 * Every value marked PLACEHOLDER must be replaced with real business information
 * before launch; while `contactIsPlaceholder` is true the UI labels them as such.
 */
export const studio: StudioConfig = {
  name: 'ARHA',
  legalName: 'ARHA Studio',
  tagline: 'Architecture & Interiors',
  descriptor: 'Interiors composed in stone, timber and light.',
  email: 'studio@example.com', // PLACEHOLDER
  phone: '+00 000 000 0000', // PLACEHOLDER
  location: 'Studio address to be confirmed', // PLACEHOLDER
  hours: 'Consultations by appointment',
  socials: [
    // PLACEHOLDER profiles — point these to the studio's real accounts
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Pinterest', href: 'https://www.pinterest.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ],
  contactIsPlaceholder: true,
}

export const navigation: NavItem[] = [
  { label: 'Projects', to: '/projects' },
  { label: 'Studio', to: '/studio' },
  { label: 'Services', to: '/services' },
  { label: 'Atelier', to: '/atelier' },
  { label: 'Journal', to: '/journal' },
  { label: 'Contact', to: '/contact' },
]

export const legalNavigation: NavItem[] = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
]

export const inquiry: InquiryConfig = {
  projectTypes: [
    'Private residence',
    'Villa',
    'Apartment / penthouse',
    'Hospitality',
    'Commercial / workplace',
    'Consultation only',
  ],
  budgets: [
    'To be discussed',
    'Under 100k',
    '100k – 250k',
    '250k – 500k',
    '500k – 1M',
    'Above 1M',
  ],
  endpoint: import.meta.env.VITE_INQUIRY_ENDPOINT || undefined,
}
