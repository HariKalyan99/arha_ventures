import type { InquiryConfig, NavItem, StudioConfig } from '../types/content'

/**
 * Studio identity and contact details.
 * Every value marked PLACEHOLDER must be replaced with real business information
 * before launch; while `contactIsPlaceholder` is true the UI labels them as such.
 */
export const studio: StudioConfig = {
  name: 'ARHA',
  legalName: 'Arha Ventures',
  tagline: 'Architecture & Interiors',
  descriptor: 'Interiors composed in stone, timber and light.',
  email: 'studio@example.com', // PLACEHOLDER — not listed on Google Business Profile
  phone: '+91 91136 16705',
  location:
    '19, S S Arcade, Guniagrahara, near Lakshmipura Layout cross, Shivakote, Bengaluru, Karnataka 560097',
  coordinates: { lat: 13.092945, lng: 77.529367 },
  hours: 'Mon–Sat · 9:30 am – 6:00 pm',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/arhaventures/' },
    { label: 'Pinterest', href: 'https://www.pinterest.com/' }, // PLACEHOLDER
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' }, // PLACEHOLDER
  ],
  /** Email is still a placeholder; address and phone are live from Google. */
  contactIsPlaceholder: true,
}

/** Public Google reviews listing for Arha Ventures (Shivakote). */
export const googleReviewsUrl = 'https://share.google/aubZ5UDGi6O2u9kAQ'

/** Summary shown beside Voices — matches the Google Business Profile listing. */
export const googleReviews = {
  rating: 4.7,
  count: 23,
  href: googleReviewsUrl,
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
