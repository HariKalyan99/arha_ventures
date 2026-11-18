import { Fragment, type ElementType, type ReactNode } from 'react'

/** Headline whose lines slide up from a mask (pair with data-reveal="lines" on a parent or itself). */
export function Lines({ lines, as: Tag = 'span', className = '' }: { lines: ReactNode[]; as?: ElementType; className?: string }) {
  return (
    <Tag className={className} data-reveal="lines">
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <span data-line className="block">
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}

/** Paragraph split into words for the scrubbed brightening effect. */
export function Words({ text, emphasis = [], as: Tag = 'p', className = '' }: { text: string; emphasis?: string[]; as?: ElementType; className?: string }) {
  const words = text.split(' ')
  return (
    <Tag className={className} data-reveal="words">
      {words.map((word, i) => {
        const clean = word.replace(/[.,—]/g, '')
        const isEm = emphasis.includes(clean)
        return (
          <Fragment key={i}>
            <span data-word className="inline-block">
              {isEm ? <em>{word}</em> : word}
            </span>{' '}
          </Fragment>
        )
      })}
    </Tag>
  )
}
