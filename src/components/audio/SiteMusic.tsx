import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { play } from '../bencho/sounds/sounds'
import { readMusicMuted, SITE_MUSIC_SRC, writeMusicMuted } from '../../lib/siteMusic'

const BAR_COUNT = 5
const VOLUME = 0.38

/**
 * Background theme — native HTMLAudioElement (qdigital99 pattern).
 * No Web Audio graph: reliable on iOS Safari / Android Chrome.
 * Starts muted; equalizer unmute (bottom-left mobile / bottom-right md+) is the only gesture that plays.
 */
export function SiteMusic() {
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

  const playTheme = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return Promise.reject(new Error('no audio'))
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
  }, [])

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

  return (
    <>
      <audio
        ref={audioRef}
        src={SITE_MUSIC_SRC}
        loop
        preload="metadata"
        playsInline
        className="sr-only"
        aria-hidden
      />

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
        animate={{
          boxShadow: live
            ? '0 0 0 1px rgba(232,224,210,0.22), 0 0 22px rgba(182,155,117,0.35)'
            : '0 0 0 1px rgba(232,224,210,0.12)',
        }}
        transition={{ duration: 0.35 }}
        className="music-toggle fixed z-[55] flex size-11 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-line/50 bg-[#111111]/72 text-parchment backdrop-blur-md md:size-12"
      >
        <span
          className={`music-wave ${live ? 'music-wave--live' : 'music-wave--muted'}`}
          aria-hidden
        >
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <span key={i} className="music-wave-bar" />
          ))}
        </span>
      </motion.button>
    </>
  )
}
