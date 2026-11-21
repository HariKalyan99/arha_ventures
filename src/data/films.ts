export type FilmClip = {
  id: string
  src: string
  /** Short caption shown when the panel is open */
  label: string
  /** Space type for accessible naming */
  space: string
}

/**
 * Curated site film — finished moments that read as ARHA work.
 * Construction / plastic-wrap / clutter clips stay out.
 */
export const filmClips: FilmClip[] = [
  {
    id: 'mandir',
    src: '/videos/mandir.mp4',
    label: 'Timber & light',
    space: 'Private shrine',
  },
  {
    id: 'screens',
    src: '/videos/screens.mp4',
    label: 'Screened volume',
    space: 'Partition screens',
  },
  {
    id: 'bedroom',
    src: '/videos/bedroom.mp4',
    label: 'Quiet chamber',
    space: 'Bedroom',
  },
  {
    id: 'headboard',
    src: '/videos/headboard.mp4',
    label: 'Navy & brass',
    space: 'Master suite',
  },
  {
    id: 'kitchen',
    src: '/videos/kitchen.mp4',
    label: 'Honey oak',
    space: 'Kitchen',
  },
  {
    id: 'dining',
    src: '/videos/dining.mp4',
    label: 'Coffered warm',
    space: 'Dining hall',
  },
  {
    id: 'reception',
    src: '/videos/reception.mp4',
    label: 'Arrival',
    space: 'Reception',
  },
  {
    id: 'lobby',
    src: '/videos/lobby.mp4',
    label: 'Warm welcome',
    space: 'Lobby desk',
  },
]
