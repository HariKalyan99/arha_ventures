import type { JournalEntry } from '../types/content'
import { media } from './media'

/**
 * SAMPLE JOURNAL — illustrative articles demonstrating the editorial layout.
 * Replace with the studio's own writing (set `sample: false`) or remove the Journal route.
 */
export const journal: JournalEntry[] = [
  {
    slug: 'on-restraint',
    title: 'On restraint: designing with fewer materials',
    category: 'Perspective',
    date: '2026-09-14',
    readTime: '5 min read',
    excerpt: 'Why a palette of three materials, used with conviction, almost always outlasts a palette of twelve.',
    cover: media['living-stone'],
    sample: true,
    body: [
      {
        paragraphs: [
          'The most common request we hear at the start of a project is for a home that feels calm. The most reliable way to deliver it is also the least glamorous: use fewer materials, and use them generously.',
          'When a single stone runs from the floor of the hall into the kitchen and up the wall of the bath, the eye stops cataloguing surfaces and starts reading space. Rooms feel larger, junctions become quieter, and the material itself has room to show its character.',
        ],
      },
      {
        heading: 'A palette of three',
        paragraphs: [
          'We usually begin with one stone, one timber and one metal, then test every later decision against them. A fourth material has to earn its place by doing something the first three cannot — softening acoustics, perhaps, or bringing colour to a room without daylight.',
          'Textiles are the exception. Layered linen, wool and bouclé add depth without competing with the architecture, and they are the easiest layer to change as a household evolves.',
        ],
      },
      {
        heading: 'Restraint is not absence',
        paragraphs: [
          'A restrained room is not an empty one. It is a room where every element has been chosen, drawn and placed with intent — where the quality of a single handle or the line of a skirting board can be appreciated because nothing louder is in the way.',
        ],
      },
    ],
  },
  {
    slug: 'light-after-dusk',
    title: 'Light after dusk: layering a living room',
    category: 'Lighting',
    date: '2026-07-02',
    readTime: '6 min read',
    excerpt: 'Ambient, task and accent light — and why the best evening rooms are lit from below eye level.',
    cover: media['bedroom-dark'],
    sample: true,
    body: [
      {
        paragraphs: [
          'Most living rooms are lit like offices: an even wash from the ceiling that flattens texture and makes every corner equally important. After dark, a good room should do the opposite.',
        ],
      },
      {
        heading: 'Three layers',
        paragraphs: [
          'Ambient light sets the overall level and should be almost invisible — a concealed cove, a wall wash, or light bounced from joinery. Task light sits where you read, cook or work. Accent light picks out the few things worth looking at: a stone wall, a painting, the grain of a table.',
          'Each layer should be on its own circuit and dimmable, so the room can move from late afternoon to midnight without anyone touching more than one control.',
        ],
      },
      {
        heading: 'Below eye level',
        paragraphs: [
          'As the evening deepens, bring light down. Table lamps, low wall lights and a fire shift the centre of gravity of the room and make it feel smaller in the best sense — more enclosing, more intimate.',
        ],
      },
    ],
  },
  {
    slug: 'choosing-stone',
    title: 'Choosing stone: marble, travertine and limestone',
    category: 'Materials',
    date: '2026-04-21',
    readTime: '7 min read',
    excerpt: 'A practical guide to how natural stones behave in a home — and how to choose one you will still love in twenty years.',
    cover: media['marble-black'],
    sample: true,
    body: [
      {
        paragraphs: [
          'Natural stone is the material clients ask about most, and the one most often specified for the wrong reasons. Beautiful in a sample, a stone has to perform for decades under feet, pans and sunlight.',
        ],
      },
      {
        heading: 'Marble',
        paragraphs: [
          'Dense and luminous, marble rewards book-matching and large formats. It etches with acids, so in kitchens we often specify a honed or leathered finish that lets marks blend into a natural patina rather than standing out against a polish.',
        ],
      },
      {
        heading: 'Travertine',
        paragraphs: [
          'Warm and porous, travertine brings softness to large floors and walls. Filled and honed, it is practical for most rooms; left unfilled, it becomes a textured, almost archaeological surface best kept for feature walls.',
        ],
      },
      {
        heading: 'Limestone',
        paragraphs: [
          'Quiet and consistent, limestone is the stone we turn to when a material needs to read as architecture rather than ornament. It moves seamlessly from interior to terrace, making the boundary between inside and out feel thinner.',
        ],
      },
      {
        heading: 'See it at scale',
        paragraphs: [
          'Whatever the stone, choose it from full slabs, not samples, and look at it in the light of the room it is destined for. Variation that seems wild in a showroom often becomes the most beautiful thing in a finished space.',
        ],
      },
    ],
  },
]

export function getJournalEntry(slug: string) {
  return journal.find((entry) => entry.slug === slug)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
