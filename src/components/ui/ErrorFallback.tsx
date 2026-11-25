import { Link } from 'react-router'
import { usePageMeta } from '../../hooks/usePageMeta'
import { media } from '../../data/media'
import { navigation } from '../../data/site'
import { ArrowButton, ArrowLink } from './ArrowButton'
import { Img } from './Img'

type ErrorFallbackProps = {
  /** Optional technical detail — shown muted; never blocks recovery. */
  error?: Error | null
  onRetry?: () => void
  /** Full-viewport treatment (root crash) vs. in-layout page section. */
  variant?: 'page' | 'section'
}

/**
 * Branded client-error UI — same language as 404, for construction & interiors.
 */
export function ErrorFallback({ error, onRetry, variant = 'page' }: ErrorFallbackProps) {
  usePageMeta('Something went wrong')

  const sectionClass =
    variant === 'page'
      ? 'relative flex min-h-svh items-end overflow-hidden bg-ink'
      : 'relative flex min-h-[70svh] items-end overflow-hidden bg-ink'

  return (
    <section aria-labelledby="error-title" className={sectionClass} role="alert">
      <div className="absolute inset-0">
        <Img media={media['house-dusk']} priority className="size-full object-cover opacity-40" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      </div>
      <div className="shell relative grid gap-12 pt-[calc(var(--header-h)+4rem)] pb-[clamp(4rem,10vh,8rem)] lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-gold">Something went wrong</p>
          <h1 id="error-title" className="display mt-6 text-display-xl text-cream">
            This build hit a <em>snag</em>.
          </h1>
          <p className="mt-6 max-w-md text-cream/75">
            An unexpected error stopped this view. You can try again, or head back to a solid footing — projects, studio, or contact.
          </p>
          {import.meta.env.DEV && error?.message ? (
            <p className="mt-4 max-w-md font-mono text-[0.7rem] leading-relaxed text-cream/35 break-words">
              {error.message}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {onRetry ? (
              <ArrowButton type="button" variant="solid" onClick={onRetry}>
                Try again
              </ArrowButton>
            ) : null}
            <ArrowLink to="/" variant={onRetry ? 'outline' : 'solid'}>
              Return home
            </ArrowLink>
          </div>
        </div>
        <nav aria-label="Suggested pages" className="lg:col-span-4 lg:col-start-9">
          <ul className="border-t border-line">
            {navigation.map((item) => (
              <li key={item.to} className="border-b border-line">
                <Link
                  to={item.to}
                  className="flex items-center justify-between py-4 text-cream/75 transition-colors duration-500 hover:text-cream"
                >
                  <span className="font-display text-xl">{item.label}</span>
                  <span aria-hidden className="text-gold">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
