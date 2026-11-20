export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'arha-theme'
export const THEME_EVENT = 'arha-theme'

const THEME_COLORS: Record<Theme, string> = {
  light: '#f3eee6',
  dark: '#171717',
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

export function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(raw)) return raw
  } catch {
    /* private mode / blocked storage */
  }
  return 'light'
}

const BOOT_LOGO_LIGHT = '/brand/arha-logo.png?v=7'
const BOOT_LOGO_DARK = '/brand/arha-logo-on-dark.png?v=7'

/** Apply theme to <html> + theme-color meta. Safe to call before React mounts. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[theme])

  const scheme = document.querySelector('meta[name="color-scheme"]')
  if (scheme) scheme.setAttribute('content', theme)

  const boot = document.getElementById('boot')
  if (boot) {
    boot.style.background = theme === 'dark' ? '#111111' : '#e8e0d2'
    const img = boot.querySelector('img')
    if (img) img.src = theme === 'dark' ? BOOT_LOGO_DARK : BOOT_LOGO_LIGHT
  }
}

export function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
  applyTheme(theme)
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }))
}

export function toggleTheme(current: Theme): Theme {
  const next: Theme = current === 'light' ? 'dark' : 'light'
  persistTheme(next)
  return next
}
