export type ModelAnnotation = {
  id: string
  x: number
  y: number
  z: number
  label: string
  createdAt: number
}

function storageKey(slug: string) {
  return `arha:model-review:${slug}`
}

export function loadAnnotations(slug: string): ModelAnnotation[] {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ModelAnnotation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAnnotations(slug: string, annotations: ModelAnnotation[]) {
  localStorage.setItem(storageKey(slug), JSON.stringify(annotations))
}

export function clearAnnotations(slug: string) {
  localStorage.removeItem(storageKey(slug))
}
