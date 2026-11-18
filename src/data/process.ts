import type { ProcessStage } from '../types/content'
import { media } from './media'

export const processStages: ProcessStage[] = [
  {
    id: 'discovery',
    title: 'Discovery & Consultation',
    summary: 'We begin by listening: to how you live, what you collect, what you want to leave behind. A site visit and a brief written together.',
    deliverables: ['Site visit', 'Written brief', 'Budget framework'],
    image: media['meeting'],
  },
  {
    id: 'concept',
    title: 'Concept Development',
    summary: 'A single idea that every later decision can be measured against — expressed in sketches, references and a first material mood.',
    deliverables: ['Concept narrative', 'Sketch studies', 'Mood palette'],
    image: media['drawing'],
  },
  {
    id: 'planning',
    title: 'Space Planning',
    summary: 'Measured layouts that test circulation, light and furniture at true scale before anything is specified.',
    deliverables: ['Measured survey', 'Layout options', 'Furniture plans'],
    image: media['plans'],
  },
  {
    id: 'materials',
    title: 'Material & Finish Selection',
    summary: 'Stone, timber, metal and textile chosen in person, sampled at scale and reviewed under morning and evening light.',
    deliverables: ['Sample boards', 'Stone selection', 'Finish schedule'],
    image: media['stone-texture'],
  },
  {
    id: 'development',
    title: 'Design Development',
    summary: 'Every junction, joint and light fitting resolved in detailed drawings, so that the site has nothing left to guess.',
    deliverables: ['Technical drawings', 'Joinery details', 'Lighting plan'],
    image: media['wood-dark'],
  },
  {
    id: 'execution',
    title: 'Execution & Installation',
    summary: 'We stay on site with the builders and makers, protecting the intent of the design through every decision.',
    deliverables: ['Site supervision', 'Maker coordination', 'Quality reviews'],
    image: media['construction'],
  },
  {
    id: 'handover',
    title: 'Final Handover',
    summary: 'Furniture placed, art hung, beds made. You walk into a finished home, with a care guide for every material in it.',
    deliverables: ['Installation & styling', 'Care manual', 'Aftercare visit'],
    image: media['living-garden-view'],
  },
]
