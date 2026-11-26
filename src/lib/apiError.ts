/** Pull a safe string from API / Vercel error JSON (never return a raw object). */
export function readApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const error = (payload as { error?: unknown }).error
  if (typeof error === 'string' && error.trim()) return error
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}
