import type { ImgHTMLAttributes } from 'react'
import { LOGO_ON_DARK_SRC, LOGO_SRC } from '../../data/brand'
import { useTheme } from '../../hooks/useTheme'

/** Dark-ink lockup on light paper; cream lockup on dark grounds. */
export function themeLogoSrc(isDark: boolean) {
  return isDark ? LOGO_ON_DARK_SRC : LOGO_SRC
}

type ThemeLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** Force a plate context — parchment plate always wants the dark-ink mark. */
  onPlate?: boolean
}

/** Brand lockup that follows `data-theme` (or stays dark-ink on a light plate). */
export function ThemeLogo({ onPlate = false, alt = '', ...rest }: ThemeLogoProps) {
  const { isDark } = useTheme()
  const src = onPlate ? LOGO_SRC : themeLogoSrc(isDark)
  return <img src={src} alt={alt} {...rest} />
}
