import { studioCredit } from '../../data/site'

type TronzlabsAttributionProps = {
  className?: string
}

/**
 * “Developed by TronzLabs” — shared footer credit pattern.
 */
export function TronzlabsAttribution({ className = '' }: TronzlabsAttributionProps) {
  return (
    <a
      href={studioCredit.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs transition-opacity hover:opacity-90 sm:justify-start ${className}`}
    >
      <span className="text-cream/45">{studioCredit.label}</span>
      <span className="font-medium whitespace-nowrap">
        <span className="text-cream">Tron</span>
        <span className="text-red-500 underline underline-offset-2">z</span>
        <span className="text-cream/55">labs</span>
      </span>
      <img
        src="/tronzlabs-logo.png"
        alt=""
        width={16}
        height={16}
        className="studio-logo-glow h-4 w-4 shrink-0 object-contain"
        aria-hidden
      />
    </a>
  )
}
