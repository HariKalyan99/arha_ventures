import type { InquiryConfig, NavItem, StudioConfig } from '../types/content'

/**
 * Studio identity and contact details.
 * Every value marked PLACEHOLDER must be replaced with real business information
 * before launch; while `contactIsPlaceholder` is true the UI labels them as such.
 */
export const studio: StudioConfig = {
  name: 'ARHA',
  legalName: 'Arha Ventures',
  tagline: 'Construction & Interiors',
  descriptor: 'Spaces that inspire, connect, and stand the test of time.',
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

/**
 * Company narrative as shared by the client.
 * Keep the wording — the site presents it, it does not rewrite it.
 */
export const company = {
  paragraphs: [
    'ARHA Ventures is a design-driven construction and interior solutions company committed to transforming ideas into exceptional spaces. We bring together creativity, technical expertise, quality craftsmanship, and professional execution to deliver projects that reflect our clients’ vision and aspirations.',
    'From architectural planning and building construction to sophisticated interior design and turnkey solutions, we offer comprehensive services tailored to meet the unique requirements of every project.',
    'Our approach combines innovative design, intelligent space planning, premium materials, and attention to detail to create spaces that are not only visually appealing but also functional, sustainable, and built to last.',
    'At ARHA Ventures, we believe every project is an opportunity to create something meaningful. We focus on building lasting relationships through transparency, reliability, quality, and timely project delivery.',
  ],
  belief:
    'We don’t just build structures; we create spaces that inspire, connect, and stand the test of time.',
  vision:
    'To become a trusted name in the construction and design industry by setting new standards in innovation, quality, and excellence.',
  mission:
    'To deliver exceptional construction and interior solutions through creative thinking, professional expertise, quality execution, and customer-focused service.',
  values: [
    { title: 'Quality', body: 'Maintaining high standards in every detail.' },
    { title: 'Innovation', body: 'Embracing modern design and construction techniques.' },
    { title: 'Integrity', body: 'Building trust through transparency and commitment.' },
    { title: 'Excellence', body: 'Delivering beyond expectations.' },
    { title: 'Client Satisfaction', body: 'Turning our clients’ visions into reality.' },
  ],
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
