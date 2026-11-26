import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertMock = vi.fn()
const fromMock = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      gte: vi.fn(async () => ({ count: 0, error: null })),
    })),
  })),
  insert: insertMock,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}))

import handler from './inquiry'

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Hari Kalyan',
    email: 'hari@example.com',
    phone: '+91 91136 16705',
    projectType: 'Villa',
    location: 'Bengaluru',
    budget: 'To be discussed',
    message: 'We would like to discuss interiors for a new villa project.',
    source: 'website',
    website: '',
    ...overrides,
  }
}

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request('https://arha-ventures.vercel.app/api/inquiry', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function readJson(res: Response) {
  const text = await res.text()
  return text ? (JSON.parse(text) as unknown) : null
}

describe('POST /api/inquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
    insertMock.mockResolvedValue({ data: null, error: null })
  })

  it('rejects non-POST methods', async () => {
    const res = await handler(makeRequest('GET'))
    expect(res.status).toBe(405)
  })

  it('answers OPTIONS for allowed origins', async () => {
    const res = await handler(makeRequest('OPTIONS', undefined, { origin: 'http://localhost:5173' }))
    expect(res.status).toBe(200)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })

  it('rejects disallowed origins', async () => {
    const res = await handler(
      makeRequest('POST', validBody(), { origin: 'https://evil.example' }),
    )
    expect(res.status).toBe(403)
  })

  it('returns 500 when Supabase env is missing', async () => {
    delete process.env.SUPABASE_URL
    const res = await handler(makeRequest('POST', validBody()))
    expect(res.status).toBe(500)
    expect(await readJson(res)).toEqual({ error: 'Server configuration error' })
  })

  it('returns 400 for invalid payloads', async () => {
    const res = await handler(makeRequest('POST', validBody({ email: 'bad' })))
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-allowlisted project types', async () => {
    const res = await handler(makeRequest('POST', validBody({ projectType: 'NotARealType' })))
    expect(res.status).toBe(400)
    expect(await readJson(res)).toEqual({ error: 'Please choose a valid project type.' })
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions without inserting', async () => {
    const res = await handler(makeRequest('POST', validBody({ website: 'http://bot.example' })))
    expect(res.status).toBe(200)
    expect(await readJson(res)).toEqual({ success: true })
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('inserts a valid enquiry without returning a row id', async () => {
    const res = await handler(
      makeRequest('POST', validBody({ source: 'spoofed' }), {
        'x-forwarded-for': '203.0.113.9',
        'user-agent': 'vitest',
      }),
    )
    const body = await readJson(res)
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true })
    expect(body).not.toHaveProperty('id')
    expect(fromMock).toHaveBeenCalledWith('inquiries')
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        email: 'hari@example.com',
        project_type: 'Villa',
        source: 'website',
        client_ip: '203.0.113.9',
      }),
    ])
  })

  it('returns 429 when the email rate limit is hit', async () => {
    fromMock.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(async () => ({ count: 3, error: null })),
        })),
      })),
      insert: insertMock,
    }))

    const res = await handler(makeRequest('POST', validBody()))
    expect(res.status).toBe(429)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('returns 503 when rate-limit lookup fails (fail-closed)', async () => {
    fromMock.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(async () => ({ count: null, error: { message: 'timeout' } })),
        })),
      })),
      insert: insertMock,
    }))

    const res = await handler(makeRequest('POST', validBody()))
    expect(res.status).toBe(503)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    insertMock.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })
    const res = await handler(makeRequest('POST', validBody()))
    expect(res.status).toBe(500)
    expect(await readJson(res)).toEqual({ error: 'Server error' })
  })
})
