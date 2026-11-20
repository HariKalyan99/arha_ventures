import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { Magnetic } from './Magnetic'

type Variant = 'solid' | 'outline' | 'ghost'

/** Standard CTA height — compact on phones, comfortable from sm up. */
const base =
  'group relative inline-flex min-h-10 items-center disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11'

const variants: Record<Variant, string> = {
  solid:
    'overflow-hidden bg-terracotta px-4 text-parchment transition-[background-color,box-shadow,color,transform] duration-500 ease-[var(--ease-luxe)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),4px_4px_10px_rgba(42,34,30,0.16),-3px_-3px_8px_rgba(255,255,255,0.6)] hover:bg-parchment hover:text-on-plate hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),5px_5px_12px_rgba(42,34,30,0.12),-4px_-4px_10px_rgba(255,255,255,0.8)] active:translate-y-px active:shadow-[inset_3px_3px_8px_rgba(96,74,59,0.2),inset_-2px_-2px_6px_rgba(255,255,255,0.5)] focus-visible:bg-parchment focus-visible:text-on-plate sm:px-5',
  outline:
    'overflow-hidden border border-terracotta/45 bg-obsidian px-4 text-cream transition-[border-color,background-color,box-shadow,transform] duration-500 ease-[var(--ease-luxe)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),3px_3px_10px_rgba(42,34,30,0.1),-2px_-2px_6px_rgba(255,255,255,0.65)] hover:border-terracotta hover:bg-espresso hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),4px_4px_12px_rgba(42,34,30,0.12),-3px_-3px_8px_rgba(255,255,255,0.75)] active:translate-y-px active:shadow-[inset_3px_3px_8px_rgba(42,34,30,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.65)] focus-visible:border-terracotta sm:px-5',
  ghost: 'px-0 text-cream hover:text-terracotta focus-visible:text-terracotta',
}

function ArrowIcon({ className = '' }: { className?: string }) {
  return <ArrowUpRight aria-hidden className={`size-3.5 shrink-0 sm:size-4 ${className}`} strokeWidth={1.25} />
}

/**
 * Solid / outline: vertical text roll (label + arrow as one unit).
 * Ghost: hairline underline + arrow drift — lighter motion for inline CTAs.
 */
function Inner({ children, variant }: { children: ReactNode; variant: Variant }) {
  if (variant === 'ghost') {
    return (
      <span className="relative inline-flex items-center gap-2.5 eyebrow sm:gap-3">
        <span className="relative">
          {children}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-[0.2em] h-px origin-left scale-x-0 bg-terracotta transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
          />
        </span>
        <ArrowIcon className="transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transition-none" />
      </span>
    )
  }

  const line = (
    <span className="flex h-10 items-center gap-2.5 eyebrow sm:h-11 sm:gap-3">
      <span>{children}</span>
      <ArrowIcon />
    </span>
  )

  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="relative block h-10 overflow-hidden sm:h-11">
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

export function ArrowButton({ variant = 'outline', className = '', children, disabled, ...rest }: ArrowButtonProps) {
  const el = (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...rest}>
      <Inner variant={variant}>{children}</Inner>
    </button>
  )
  if (variant === 'ghost' || disabled) return el
  return <Magnetic strength={0.26}>{el}</Magnetic>
}

interface ArrowLinkProps {
  to: string
  variant?: Variant
  className?: string
  children: ReactNode
}

export function ArrowLink({ to, variant = 'outline', className = '', children }: ArrowLinkProps) {
  const el = (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  )
  if (variant === 'ghost') return el
  return <Magnetic strength={0.26}>{el}</Magnetic>
}
