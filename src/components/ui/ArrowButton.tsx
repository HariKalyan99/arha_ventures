import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

type Variant = 'solid' | 'outline' | 'ghost'

const base =
  'group relative inline-flex min-h-12 items-center gap-3 overflow-hidden px-6 py-3 eyebrow transition-colors duration-700 ease-[var(--ease-luxe)] disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  solid: 'bg-gold text-obsidian hover:bg-cream',
  outline: 'border border-gold/60 text-cream hover:border-gold hover:text-obsidian',
  ghost: 'px-0 text-cream hover:text-gold',
}

function Inner({ children, variant }: { children: ReactNode; variant: Variant }) {
  return (
    <>
      {variant === 'outline' && (
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 bg-gold transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
        />
      )}
      <span className="relative">{children}</span>
      <ArrowUpRight
        aria-hidden
        className="relative size-4 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        strokeWidth={1.25}
      />
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
