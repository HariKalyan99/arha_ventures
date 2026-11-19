interface SectionLabelProps {
  index: string
  label: string
  className?: string
}

/** Architectural section marker: index, hairline, label. */
export function SectionLabel({ index, label, className = '' }: SectionLabelProps) {
  return (
    <p className={`eyebrow flex items-center gap-4 text-gold ${className}`}>
      <span className="tabular-nums">{index}</span>
      <span aria-hidden className="h-px w-10 bg-gold/50" />
      <span className="text-cream/50">{label}</span>
    </p>
  )
}
