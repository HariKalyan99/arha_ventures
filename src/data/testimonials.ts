import type { Testimonial } from '../types/content'

/**
 * Client voices drawn from public Google reviews for Arha Ventures (Shivakote).
 * Avatars cached under /public/images/reviewers/ from reviewers’ public Google profiles.
 * Full thread: https://share.google/aubZ5UDGi6O2u9kAQ
 */
function reviewerPhoto(file: string, name: string): NonNullable<Testimonial['avatar']> {
  return {
    src: `/images/reviewers/${file}`,
    alt: `${name} — Google reviewer`,
    width: 256,
    height: 256,
  }
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'Had a really great experience with Arha Ventures throughout our construction and interior journey. The team was very understanding, patient, and easy to work with from start to finish. They paid attention to even the smallest details.',
    attribution: 'Akarsha S Gowda',
    reference: 'Google review',
    avatar: reviewerPhoto('akarsha-s-gowda.jpg', 'Akarsha S Gowda'),
    sample: false,
  },
  {
    id: 't2',
    quote:
      'We’re truly grateful to Arha Ventures for turning our vision into such a beautiful reality. Every detail was handled with so much care, professionalism, and perfection. More than just construction, they created a space that feels warm.',
    attribution: 'Vini Rathore',
    reference: 'Google review',
    avatar: reviewerPhoto('vini-rathore.jpg', 'Vini Rathore'),
    sample: false,
  },
  {
    id: 't3',
    quote:
      'I recently got my construction and interior work done by Arha Ventures and I’m really happy with the outcome. The quality of work is excellent and everything was completed on time. The owner was very helpful throughout the process.',
    attribution: 'Sakshi Sul',
    reference: 'Google review',
    avatar: reviewerPhoto('sakshi-sul.jpg', 'Sakshi Sul'),
    sample: false,
  },
  {
    id: 't4',
    quote:
      'Satisfied with the work done by Arha Ventures. The team was responsive and the quality of interiors is really good. The final result looks nice and practical.',
    attribution: 'Rishika Datta',
    reference: 'Google review',
    avatar: reviewerPhoto('rishika-datta.jpg', 'Rishika Datta'),
    sample: false,
  },
  {
    id: 't5',
    quote:
      'We chose Arha Ventures for both construction and interiors, and overall it was a good experience. The owner was involved and made sure our ideas were considered properly. He also gave useful suggestions that helped improve the final design. The project was handled step by step, and we are happy with how the house turned out.',
    attribution: 'Harini Sri',
    reference: 'Google review',
    avatar: reviewerPhoto('harini-sri.jpg', 'Harini Sri'),
    sample: false,
  },
]