import { Link } from 'react-router'
import { ArrowLink } from '../components/ui/ArrowButton'
import { Img } from '../components/ui/Img'
import { media } from '../data/media'
import { navigation } from '../data/site'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta('Page not found')
  return (
    <section aria-labelledby="nf-title" className="relative flex min-h-svh items-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Img media={media['stair-view']} priority className="size-full object-cover opacity-40" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      </div>
      <div className="shell relative grid gap-12 pt-[calc(var(--header-h)+4rem)] pb-[clamp(4rem,10vh,8rem)] lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-gold">Error 404</p>
          <h1 id="nf-title" className="display mt-6 text-display-xl text-cream">
            This room <em>doesn’t exist</em> — yet.
          </h1>
          <p className="mt-6 max-w-md text-cream/75">The page you were looking for may have moved, or the address may be mistyped.</p>
          <div className="mt-10">
            <ArrowLink to="/" variant="solid">
              Return home
            </ArrowLink>
          </div>
        </div>
        <nav aria-label="Suggested pages" className="lg:col-span-4 lg:col-start-9">
          <ul className="border-t border-line">
            {navigation.map((item) => (
              <li key={item.to} className="border-b border-line">
                <Link to={item.to} className="flex items-center justify-between py-4 text-cream/75 transition-colors duration-500 hover:text-cream">
                  <span className="font-display text-xl">{item.label}</span>
                  <span aria-hidden className="text-gold">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
