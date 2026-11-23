export type FilmClip = {
  id: string
  src: string
  /** Still shown before the clip has a frame */
  poster: string
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
    poster: '/videos/posters/mandir.webp',
    label: 'Timber & light',
    space: 'Private shrine',
  },
  {
    id: 'screens',
    src: '/videos/screens.mp4',
    poster: '/videos/posters/screens.webp',
    label: 'Screened volume',
    space: 'Partition screens',
  },
  {
    id: 'bedroom',
    src: '/videos/bedroom.mp4',
    poster: '/videos/posters/bedroom.webp',
    label: 'Quiet chamber',
    space: 'Bedroom',
  },
  {
    id: 'headboard',
    src: '/videos/headboard.mp4',
    poster: '/videos/posters/headboard.webp',
    label: 'Navy & brass',
    space: 'Master suite',
  },
  {
    id: 'kitchen',
    src: '/videos/kitchen.mp4',
    poster: '/videos/posters/kitchen.webp',
    label: 'Honey oak',
    space: 'Kitchen',
  },
  {
    id: 'dining',
    src: '/videos/dining.mp4',
    poster: '/videos/posters/dining.webp',
    label: 'Coffered warm',
    space: 'Dining hall',
  },
  {
    id: 'reception',
    src: '/videos/reception.mp4',
    poster: '/videos/posters/reception.webp',
    label: 'Arrival',
    space: 'Reception',
  },
  {
    id: 'lobby',
    src: '/videos/lobby.mp4',
    poster: '/videos/posters/lobby.webp',
    label: 'Warm welcome',
    space: 'Lobby desk',
  },
]
