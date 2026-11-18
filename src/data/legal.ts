import { studio } from './site'

/**
 * TEMPLATE LEGAL TEXT — written to describe how this website is actually built
 * (no analytics, no cookies, self-hosted fonts and images, enquiries sent only
 * when the visitor submits the form). It is not legal advice: have it reviewed
 * for the studio's jurisdiction and update it whenever tracking, embeds or new
 * integrations are added.
 */
export type LegalDocument = 'privacy' | 'terms'

interface LegalContent {
  title: string
  summary: string
  updated: string
  sections: { heading: string; paragraphs: string[] }[]
}

export const legalContent: Record<LegalDocument, LegalContent> = {
  privacy: {
    title: 'Privacy notice',
    summary: `How ${studio.legalName} handles personal information shared through this website.`,
    updated: '18 November 2026',
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          `This website is operated by ${studio.legalName}. For any question about your personal information, contact us at ${studio.email}.`,
        ],
      },
      {
        heading: 'What we collect',
        paragraphs: [
          'We only collect the information you choose to send through the enquiry form: your name, email address and, if you provide them, your telephone number, project location, project type, indicative budget and message.',
          'This website does not use analytics, advertising trackers or cookies. Fonts and images are served from our own website rather than third-party services.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'We use your details solely to respond to your enquiry and, if we go on to work together, to prepare a proposal. We do not sell your information or use it for unrelated marketing.',
        ],
      },
      {
        heading: 'Where it goes',
        paragraphs: [
          'When you submit the form, your enquiry is transmitted to the inbox or service the studio uses to receive enquiries. If you choose to send it from your own email application instead, it is handled by your email provider and ours.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'Enquiries that do not lead to a project are deleted within a reasonable period. Project correspondence is retained for as long as is necessary for the project and our legal obligations.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'Depending on where you live, you may have the right to access, correct or delete the personal information we hold about you, or to object to how it is used. Contact us and we will respond promptly.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    summary: `Terms governing the use of the ${studio.legalName} website.`,
    updated: '18 November 2026',
    sections: [
      {
        heading: 'About this website',
        paragraphs: [
          `This website presents the work and services of ${studio.legalName}. By using it you agree to these terms.`,
        ],
      },
      {
        heading: 'Content and imagery',
        paragraphs: [
          'Text, drawings, renders and the interactive 3D atelier are provided for general information. Photographs may be illustrative and may not depict completed work by the studio unless stated.',
          'Finishes shown in the interactive atelier are digital approximations. Colours and textures vary between screens and natural materials vary from slab to slab; final selections are always made from physical samples.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'Unless otherwise stated, the design, text and original imagery on this website belong to the studio or are used under licence. Please do not reproduce them without permission.',
        ],
      },
      {
        heading: 'No offer or advice',
        paragraphs: [
          'Nothing on this website is an offer to provide services or professional advice. Any engagement is governed by a separate written agreement.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          'We take care to keep this website accurate and available, but we cannot guarantee that it will always be error-free or uninterrupted.',
        ],
      },
    ],
  },
}
