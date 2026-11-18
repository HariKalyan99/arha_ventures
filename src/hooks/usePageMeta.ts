import { useEffect } from 'react'
import { studio } from '../data/site'

/** Sets the document title and meta description for the current page. */
export function usePageMeta(title: string | null, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${studio.name}` : `${studio.name} — ${studio.tagline}`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
