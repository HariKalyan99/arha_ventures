import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

interface FieldSelectProps {
  id: string
  name: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  className?: string
}

/** Themed listbox — same width and underline as `.field-input`; native `<select>` panels are not styleable. */
export function FieldSelect({
  id,
  name,
  value,
  options,
  onChange,
  'aria-invalid': invalid,
  'aria-describedby': describedBy,
  className = '',
}: FieldSelectProps) {
  const listId = useId()
  const root = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [listMaxH, setListMaxH] = useState(256)

  const close = useCallback(() => setOpen(false), [])

  useLayoutEffect(() => {
    if (!open || !root.current) return
    const rect = root.current.getBoundingClientRect()
    const gap = 6
    const below = window.innerHeight - rect.bottom - gap
    const above = rect.top - gap
    const wantUp = below < 160 && above > below
    setOpenUp(wantUp)
    const room = wantUp ? above : below
    setListMaxH(Math.max(120, Math.min(256, Math.floor(room))))
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open, close])

  const pick = (next: string) => {
    onChange(next)
    close()
  }

  const trapScroll = (e: React.WheelEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((v) => !v)}
        className={`field-input flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 text-left ${
          open ? 'border-b-terracotta' : ''
        }`}
      >
        <span className="min-w-0 truncate">{value}</span>
        <span
          aria-hidden
          className={`mt-0.5 size-0 shrink-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-terracotta transition-transform duration-500 ease-[var(--ease-luxe)] ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={id}
          data-lenis-prevent
          onWheel={trapScroll}
          onTouchMove={trapScroll}
          style={{ maxHeight: listMaxH }}
          className={`absolute inset-x-0 z-30 overflow-y-auto overscroll-y-contain border border-line bg-espresso py-1 shadow-[0_12px_40px_rgba(0,0,0,0.35)] touch-pan-y [-webkit-overflow-scrolling:touch] ${
            openUp ? 'bottom-full mb-1.5' : 'top-full'
          }`}
        >
          {options.map((opt) => {
            const selected = opt === value
            return (
              <li key={opt} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pick(opt)}
                  className={`block w-full px-0 py-3 text-left text-sm leading-snug transition-colors duration-500 ease-[var(--ease-luxe)] sm:py-3.5 sm:text-[0.9375rem] ${
                    selected
                      ? 'bg-gold/20 text-cream'
                      : 'text-cream/80 hover:bg-cream/8 hover:text-cream'
                  }`}
                >
                  <span className="block px-3 sm:px-4">{opt}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}