export type ReviewModel = {
  slug: string
  title: string
  file: string
  note: string
  /** Default framing when the page opens. */
  defaultView?: 'interior' | 'exterior'
}

/** Client elevation / interior GLBs under review — not part of public nav. */
export const reviewModels: ReviewModel[] = [
  {
    slug: 'ashok-elevation',
    title: 'Ashok elevation',
    file: '/models/ashok-elevation.glb',
    note: 'Exterior elevation review',
    defaultView: 'exterior',
  },
  {
    slug: 'prakash-elevation',
    title: 'Prakash elevation',
    file: '/models/prakash-elevation.glb',
    note: 'Exterior elevation review',
    defaultView: 'exterior',
  },
  {
    slug: 'sraven-interior',
    title: 'Sraven interior',
    file: '/models/sraven-interior.glb',
    note: 'Interior review',
    defaultView: 'interior',
  },
]

export function getReviewModel(slug: string) {
  return reviewModels.find((m) => m.slug === slug)
}
