import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { LeadMagnetModal } from './LeadMagnetModal'

const SESSION_KEY = 'arha_lead_magnet_shown'
const DELAY_MS = 23000

/**
 * Arms after first paint / boot. Shows once per session:
 * timed delay, or mouse leave toward the top (exit intent).
 */
export function LeadMagnetHost({ enabled = true }: { enabled?: boolean }) {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)
  const [armed, setArmed] = useState(false)
  const timerRef = useRef<number>(0)

  /* Wait until the first-paint boot splash is gone before counting down. */
  useEffect(() => {
    if (!enabled) {
      setArmed(false)
      return
    }

    const tryArm = () => {
      if (!document.documentElement.classList.contains('is-booting') && !document.getElementById('boot')) {
        setArmed(true)
        return true
      }
      return false
    }

    if (tryArm()) return undefined

    const id = window.setInterval(() => {
      if (tryArm()) window.clearInterval(id)
    }, 400)

    return () => window.clearInterval(id)
  }, [enabled, pathname])

  useEffect(() => {
    if (!enabled || !armed) {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      return undefined
    }

    const open = () => {
      if (sessionStorage.getItem(SESSION_KEY)) return
      if (document.querySelector('[data-modal-open="true"]')) return
      setVisible(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }

    timerRef.current = window.setTimeout(open, DELAY_MS)

    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return
      if (sessionStorage.getItem(SESSION_KEY)) return
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(true)
    }

    document.addEventListener('mouseleave', onLeave)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, armed])

  if (!visible) return null
  return <LeadMagnetModal onClose={() => setVisible(false)} />
}
