import { Link } from 'react-router'
import { LOGO_SRC } from '../../data/brand'
import { studio } from '../../data/site'
import { Magnetic } from '../ui/Magnetic'

/**
 * Brand mark for the header.
 * Transparent terracotta + black logo on a cream plate — readable on the dark nav.
 */
export function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Magnetic strength={0.22}>
      <Link to="/" onClick={onNavigate} className="group inline-flex items-center" aria-label={`${studio.name} — home`}>
        <span className="relative flex size-11 items-center justify-center overflow-hidden border border-gold/40 bg-cream transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-luxe)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),5px_5px_12px_rgba(0,0,0,0.45),-4px_-4px_10px_rgba(255,248,235,0.35)] group-hover:border-gold group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),6px_6px_14px_rgba(0,0,0,0.4),-5px_-5px_12px_rgba(255,248,235,0.42)] group-active:translate-y-px group-active:shadow-[inset_4px_4px_10px_rgba(96,75,59,0.22),inset_-3px_-3px_8px_rgba(255,255,255,0.55)] sm:size-12">
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
