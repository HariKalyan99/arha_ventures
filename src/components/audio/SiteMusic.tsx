import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { play } from '../bencho/sounds/sounds'
import { hasExplicitMute, readMusicMuted, SITE_MUSIC_SRC, writeMusicMuted } from '../../lib/siteMusic'

const BAR_COUNT = 5
const VOLUME = 0.38

type MusicControls = {
  live: boolean
  label: string
  toggleMute: () => void
}

const MusicContext = createContext<MusicControls | null>(null)

/**
 * Header equalizer — sits between the theme toggle and the menu.
 * Ink follows the header plate (parchment over the loft, cream on paper).
 */
export function MusicToggle({ onMedia = false }: { onMedia?: boolean }) {
  const ctx = useContext(MusicContext)
  if (!ctx) return null
  const { live, label, toggleMute } = ctx
  const ink = onMedia ? 'text-parchment' : 'text-cream'

  return (
    <motion.button
      type="button"
      data-audio-toggle
      data-bencho-sound
      onClick={(e) => {
        e.stopPropagation()
        toggleMute()
      }}
      aria-label={label}
      aria-pressed={live}
      whileTap={{ scale: 0.92 }}
      className={`music-toggle group relative z-[70] flex min-h-11 min-w-11 cursor-pointer touch-manipulation items-center justify-center px-1 ${ink}`}
    >
      <span className={`music-wave ${live ? 'music-wave--live' : 'music-wave--muted'}`} aria-hidden>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span key={i} className="music-wave-bar" />
        ))}
      </span>
    </motion.button>
  )
}

/**
 * Background theme — native HTMLAudioElement (qdigital99 pattern).
 * No Web Audio graph: reliable on iOS Safari / Android Chrome.
 * Starts on the first click anywhere. An explicit mute this session is left alone.
 */
export function SiteMusic({ children }: { children?: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(readMusicMuted())
  const [muted, setMuted] = useState(() => mutedRef.current)
  const [playing, setPlaying] = useState(false)

  const syncMuted = useCallback((next: boolean) => {
    mutedRef.current = next
    setMuted(next)
    writeMusicMuted(next)
    const audio = audioRef.current
    if (audio) audio.muted = next
  }, [])

  const ensureThemeSource = useCallback(() => {
    const audio = audioRef.current
    if (!audio || audio.dataset.srcReady === '1') return
    audio.src = SITE_MUSIC_SRC
    audio.dataset.srcReady = '1'
    audio.load()
  }, [])

  const playTheme = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return Promise.reject(new Error('no audio'))
    ensureThemeSource()
    audio.muted = false
    const p = audio.play()
    if (p && typeof p.then === 'function') {
      return p.then(() => setPlaying(true)).catch((err) => {
        setPlaying(false)
        throw err
      })
    }
    setPlaying(true)
    return Promise.resolve()
  }, [ensureThemeSource])

  const pauseTheme = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setPlaying(false)
  }, [])

  const toggleMute = useCallback(() => {
    play('latch')
    if (mutedRef.current) {
      syncMuted(false)
      playTheme().catch(() => {
        /* Autoplay may still fail — stay unmuted so the next tap retries */
      })
    } else {
      syncMuted(true)
      pauseTheme()
    }
  }, [syncMuted, playTheme, pauseTheme])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = VOLUME
    audio.muted = mutedRef.current

    const onPlay = () => setPlaying(!audio.muted)
    const onPause = () => setPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.pause()
    }
  }, [])

  /* First click anywhere starts the theme. The equalizer keeps its own toggle. */
  useEffect(() => {
    if (hasExplicitMute()) return

    let done = false
    const detach = () => document.removeEventListener('click', onDocumentClick)

    const onDocumentClick = (event: MouseEvent) => {
      if (done) return
      const target = event.target
      if (target instanceof Element && target.closest('[data-audio-toggle]')) return
      done = true
      detach()
      syncMuted(false)
      playTheme().catch(() => {})
    }

    document.addEventListener('click', onDocumentClick)
    return () => detach()
  }, [playTheme, syncMuted])

  /* Pause when the tab is hidden — resumes only if user left music on. */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pauseTheme()
      else if (!mutedRef.current) playTheme().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pauseTheme, playTheme])

  const live = playing && !muted
  const label = live ? 'Mute theme music' : 'Play theme music'
  const controls = useMemo(() => ({ live, label, toggleMute }), [live, label, toggleMute])

  return (
    <MusicContext.Provider value={controls}>
      <audio ref={audioRef} loop preload="none" playsInline className="sr-only" aria-hidden />
      {children}
    </MusicContext.Provider>
  )
}
