import { Link } from 'react-router'
import { studio } from '../../data/site'

export function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" onClick={onNavigate} className="group flex items-center gap-3" aria-label={`${studio.name} — home`}>
      <svg aria-hidden viewBox="0 0 40 32" className="h-6 w-8 text-gold transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:-translate-y-0.5">
        <path d="M6 30 20 3l14 27" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M11.6 20h16.8" fill="none" stroke="currentColor" strokeWidth="0.9" />
        <path d="M2 30h36" fill="none" stroke="#e8dfd0" strokeWidth="0.7" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-[var(--tracking-wordmark)] text-cream">{studio.name}</span>
        <span className="mt-1 text-[0.56rem] tracking-[0.32em] text-cream/55 uppercase max-sm:hidden">{studio.tagline}</span>
      </span>
    </Link>
  )
}
