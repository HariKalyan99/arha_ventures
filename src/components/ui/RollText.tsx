import type { ReactNode } from 'react'

/**
 * Duplicated label with vertical roll on `group-hover` / `group-focus-within`.
 * Viewport height is fixed so only one line shows until the roll runs.
 */
export function RollText({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const line = (
    <span
      className={`flex h-11 shrink-0 items-center text-sm leading-snug text-inherit sm:text-[0.9375rem] ${className}`}
    >
      <span className="line-clamp-2 break-words">{children}</span>
    </span>
  )

  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="relative block h-11 overflow-hidden">
        <span className="flex h-[5.5rem] flex-col transition-transform duration-[650ms] ease-[var(--ease-luxe)] will-change-transform group-hover:-translate-y-1/2 group-focus-within:-translate-y-1/2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-within:translate-y-0">
          {line}
          {line}
        </span>
      </span>
    </>
  )
}