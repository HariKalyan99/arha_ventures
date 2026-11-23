export const SITE_MUSIC_SRC = '/music/arha_theme.mp3'
export const MUSIC_MUTE_KEY = 'arha-music-muted'

/** Default muted — browsers block autoplay until a gesture. */
export function readMusicMuted(): boolean {
  try {
    const raw = sessionStorage.getItem(MUSIC_MUTE_KEY)
    if (raw === null) return true
    return raw === '1'
  } catch {
    return true
  }
}

/** True only when this session stored a mute. A missing key is "not chosen yet". */
export function hasExplicitMute(): boolean {
  try {
    return sessionStorage.getItem(MUSIC_MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeMusicMuted(muted: boolean) {
  try {
    sessionStorage.setItem(MUSIC_MUTE_KEY, muted ? '1' : '0')
  } catch {
    /* private mode / SSR */
  }
}
