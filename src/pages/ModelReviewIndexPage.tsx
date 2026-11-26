import { Link } from 'react-router'
import { reviewModels } from '../data/modelReviews'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ModelReviewIndexPage() {
  usePageMeta('Model review')

  return (
    <section className="shell py-[clamp(5rem,12vh,8rem)] pt-[calc(var(--header-h)+3rem)]">
      <p className="eyebrow text-gold">Internal</p>
      <h1 className="display mt-4 text-display-lg text-cream">Model review</h1>
      <p className="mt-4 max-w-xl text-cream/65">
        Open each elevation or interior to orbit, inspect, and drop annotation pins. Pins are stored in this browser only.
      </p>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviewModels.map((model) => (
          <li key={model.slug}>
            <Link
              to={`/review/models/${model.slug}`}
              className="group flex h-full flex-col border border-line bg-obsidian p-6 transition-colors hover:border-terracotta/50"
            >
              <span className="eyebrow text-gold">{model.note}</span>
              <span className="display mt-3 text-display-sm text-cream group-hover:text-cream">
                {model.title}
              </span>
              <span className="mt-auto pt-8 text-xs text-cream/45 group-hover:text-terracotta">
                Open viewer →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
