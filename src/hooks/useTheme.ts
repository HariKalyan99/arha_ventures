import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  THEME_EVENT,
  applyTheme,
  persistTheme,
  readStoredTheme,
  toggleTheme,
  type Theme,
} from '../lib/theme'

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_EVENT, onStoreChange)
  return () => window.removeEventListener(THEME_EVENT, onStoreChange)
}

function getSnapshot(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'dark' || attr === 'light' ? attr : readStoredTheme()
}

function getServerSnapshot(): Theme {
  return 'light'
}

/** Live site theme — light paper (default) or the earlier dark opulent plate. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    applyTheme(getSnapshot())
    setReady(true)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next)
  }, [])

  const toggle = useCallback(() => toggleTheme(getSnapshot()), [])

  return { theme, setTheme, toggle, ready, isDark: theme === 'dark' }
}
