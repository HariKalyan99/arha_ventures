import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildMailto, submitInquiry, type InquiryPayload } from './inquiry'

const payload: InquiryPayload = {
  name: 'Hari Kalyan',
  email: 'hari@example.com',
  phone: '+91 79756 53113',
  projectType: 'Villa',
  location: 'Bengaluru',
  budget: 'To be discussed',
  message: 'We would like to discuss interiors for a new villa project.',
  website: '',
}

describe('buildMailto', () => {
  it('encodes enquiry details into a mailto link', () => {
    const href = buildMailto(payload)
    expect(href.startsWith('mailto:')).toBe(true)
    expect(href).toContain(encodeURIComponent('Project enquiry — Villa'))
    expect(href).toContain(encodeURIComponent('hari@example.com'))
  })
})

describe('submitInquiry', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posts JSON to the enquiry endpoint and reports success', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true, id: '1' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await submitInquiry(payload)
    expect(result).toEqual({ status: 'sent' })
    expect(fetchMock).toHaveBeenCalledOnce()
    const call = fetchMock.mock.calls[0]
    expect(call).toBeDefined()
    const init = call?.[1] as RequestInit
    const body = JSON.parse(String(init.body)) as InquiryPayload & { source: string }
    expect(body.email).toBe('hari@example.com')
    expect(body.website).toBe('')
    expect(body.source).toBe('website')
  })

  it('surfaces rate-limit errors from the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Too many submissions for this email. Please try again later.' }), { status: 429 })),
    )
    const result = await submitInquiry(payload)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.message).toMatch(/Too many submissions/i)
    }
  })

  it('reads string messages from Vercel-style object error payloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ error: { code: '500', message: 'A server error has occurred' } }),
            { status: 500 },
          ),
      ),
    )
    const result = await submitInquiry(payload)
    expect(result).toEqual({ status: 'error', message: 'A server error has occurred' })
  })

  it('reports network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )
    const result = await submitInquiry(payload)
    expect(result).toEqual({
      status: 'error',
      message: 'The enquiry could not reach the server. Please check your connection.',
    })
  })
})
