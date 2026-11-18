import type { ImgHTMLAttributes } from 'react'
import type { MediaAsset } from '../../types/content'

interface ImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'> {
  media: MediaAsset
  /** Load immediately (above-the-fold imagery) */
  priority?: boolean
  /** Override alt text, e.g. empty for purely decorative duplicates */
  alt?: string
}

/** Responsive image with a 960w/1920w srcset, intrinsic dimensions and lazy loading by default. */
export function Img({ media, priority, alt, sizes = '100vw', className, ...rest }: ImgProps) {
  return (
    <img
      src={media.src}
      srcSet={`${media.srcSmall} 960w, ${media.src} ${media.width}w`}
      sizes={sizes}
      width={media.width}
      height={media.height}
      alt={alt ?? media.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      {...rest}
    />
  )
}
