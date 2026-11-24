import { afterEach, describe, expect, it, vi } from 'vitest'
import { submitLeadMagnet } from './leadMagnet'

describe('submitLeadMagnet', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posts name and email to the lead-magnet endpoint', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await submitLeadMagnet({ name: 'Hari', email: 'hari@example.com', website: '' })
    expect(result).toEqual({ status: 'sent' })
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    const body = JSON.parse(String(init.body)) as { source: string; name: string; email: string; guide?: string }
    expect(body.source).toBe('lead_magnet')
    expect(body.name).toBe('Hari')
    expect(body.email).toBe('hari@example.com')
    expect(body.guide).toBeUndefined()
  })

  it('surfaces API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Too many submissions for this email. Please try again later.' }), { status: 429 })),
    )
    const result = await submitLeadMagnet({ name: 'Hari', email: 'hari@example.com' })
    expect(result.status).toBe('error')
  })
})
