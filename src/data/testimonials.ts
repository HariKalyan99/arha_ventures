import type { Testimonial } from '../types/content'

/**
 * PLACEHOLDER TESTIMONIALS — written to demonstrate the layout only.
 * They are not real client statements. Replace with verified feedback
 * (with the client’s permission) and set `sample: false`.
 */
export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: 'They listened for longer than anyone else we met, and it shows in every room. The house feels like it was always ours.',
    attribution: 'Client name',
    reference: 'Private residence',
    sample: true,
  },
  {
    id: 't2',
    quote: 'What surprised us most was the calm — of the process as much as the result. Every decision arrived with a reason.',
    attribution: 'Client name',
    reference: 'Penthouse interior',
    sample: true,
  },
  {
    id: 't3',
    quote: 'Our guests talk about the light before anything else. That was exactly the brief, and it was delivered without compromise.',
    attribution: 'Client name',
    reference: 'Hospitality project',
    sample: true,
  },
]
