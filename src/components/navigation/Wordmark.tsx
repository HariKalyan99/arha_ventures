import { Link } from 'react-router'
import { LOGO_SRC } from '../../data/brand'
import { studio } from '../../data/site'
import { Magnetic } from '../ui/Magnetic'

/**
 * Brand mark for the header.
 * Black logo on a parchment plate — readable on light chrome and the hero.
 */
export function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Magnetic strength={0.22}>
      <Link to="/" onClick={onNavigate} className="group inline-flex items-center" aria-label={`${studio.name} — home`}>
        <span className="relative flex size-11 items-center justify-center overflow-hidden border border-terracotta/40 bg-parchment transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-luxe)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),4px_4px_12px_rgba(42,34,30,0.14),-3px_-3px_8px_rgba(255,255,255,0.8)] group-hover:border-terracotta group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),5px_5px_14px_rgba(42,34,30,0.16),-4px_-4px_10px_rgba(255,255,255,0.9)] group-active:translate-y-px group-active:shadow-[inset_4px_4px_10px_rgba(96,75,59,0.18),inset_-3px_-3px_8px_rgba(255,255,255,0.7)] sm:size-12">
          <img
            src={LOGO_SRC}
            alt=""
            width={1024}
            height={1024}
            decoding="async"
            className="size-full object-contain p-[8%]"
          />
        </span>
      </Link>
    </Magnetic>
  )
}
