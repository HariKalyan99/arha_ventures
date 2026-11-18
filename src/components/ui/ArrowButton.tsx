import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

type Variant = 'solid' | 'outline' | 'ghost'

const base =
  'group relative inline-flex min-h-12 items-center disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  // Vertical padding lives on the roll lines so the mask height stays exact (one label tall).
  solid: 'overflow-hidden bg-gold px-6 text-obsidian hover:bg-cream focus-visible:bg-cream',
  outline:
    'overflow-hidden border border-gold/60 px-6 text-cream hover:border-gold focus-visible:border-gold',
  ghost: 'px-0 text-cream hover:text-gold focus-visible:text-gold',
}

function ArrowIcon({ className = '' }: { className?: string }) {
  return <ArrowUpRight aria-hidden className={`size-4 shrink-0 ${className}`} strokeWidth={1.25} />
}

/**
 * Solid / outline: vertical text roll (label + arrow as one unit).
 * Ghost: hairline underline + arrow drift — lighter motion for inline CTAs.
 */
function Inner({ children, variant }: { children: ReactNode; variant: Variant }) {
  if (variant === 'ghost') {
    return (
      <span className="relative inline-flex items-center gap-3 eyebrow">
        <span className="relative">
          {children}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-[0.2em] h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
          />
        </span>
        <ArrowIcon className="transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transition-none" />
      </span>
    )
  }

  const line = (
    <span className="flex h-12 items-center gap-3 eyebrow">
      <span>{children}</span>
      <ArrowIcon />
    </span>
  )

  return (
    <>
      {/* Single accessible name; the rolling pair is decorative. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden className="relative block h-12 overflow-hidden">
        <span className="flex flex-col transition-transform duration-[650ms] ease-[var(--ease-luxe)] will-change-transform group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0">
          {line}
          {line}
        </span>
      </span>
    </>
  )
}

interface ArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function ArrowButton({ variant = 'outline', className = '', children, ...rest }: ArrowButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <Inner variant={variant}>{children}</Inner>
    </button>
  )
}

interface ArrowLinkProps {
  to: string
  variant?: Variant
  className?: string
  children: ReactNode
}

export function ArrowLink({ to, variant = 'outline', className = '', children }: ArrowLinkProps) {
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  )
}
