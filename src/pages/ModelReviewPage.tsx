import { Link, Navigate, useParams } from 'react-router'
import { ModelReviewViewer } from '../components/review/ModelReviewViewer'
import { getReviewModel, reviewModels } from '../data/modelReviews'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ModelReviewPage() {
  const { slug = '' } = useParams()
  const model = getReviewModel(slug)
  usePageMeta(model ? `Review · ${model.title}` : 'Model review')

  if (!model) return <Navigate to="/review/models" replace />

  return (
    <div className="pt-[var(--header-h)]">
      <div className="shell flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-3 text-xs text-cream/50">
        <Link to="/review/models" className="link-line hover:text-cream">
          All models
        </Link>
        <span aria-hidden className="text-cream/25">
          /
        </span>
        <nav aria-label="Review models" className="flex flex-wrap gap-x-4 gap-y-1">
          {reviewModels.map((m) => (
            <Link
              key={m.slug}
              to={`/review/models/${m.slug}`}
              className={m.slug === model.slug ? 'text-cream' : 'link-line hover:text-cream'}
              aria-current={m.slug === model.slug ? 'page' : undefined}
            >
              {m.title}
            </Link>
          ))}
        </nav>
      </div>
      <ModelReviewViewer model={model} />
    </div>
  )
}
