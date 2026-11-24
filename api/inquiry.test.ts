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

type Res = {
  statusCode: number
  body: unknown
  headers: Record<string, string>
  status: (code: number) => Res
  json: (payload: unknown) => void
  end: () => void
  setHeader: (name: string, value: string) => void
}

function mockRes(): Res {
  const res: Res = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
    },
    end() {
      this.body = this.body ?? null
    },
    setHeader(name, value) {
      this.headers[name] = value
    },
  }
  return res
}

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

describe('POST /api/inquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
    insertMock.mockResolvedValue({ data: null, error: null })
  })

  it('rejects non-POST methods', async () => {
    const res = mockRes()
    await handler({ method: 'GET', headers: {}, body: {} }, res)
    expect(res.statusCode).toBe(405)
  })

  it('answers OPTIONS for allowed origins', async () => {
    const res = mockRes()
    await handler({ method: 'OPTIONS', headers: { origin: 'http://localhost:5173' }, body: {} }, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173')
  })

  it('rejects disallowed origins', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: { origin: 'https://evil.example' },
        body: validBody(),
      },
      res,
    )
    expect(res.statusCode).toBe(403)
  })

  it('returns 500 when Supabase env is missing', async () => {
    delete process.env.SUPABASE_URL
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody() }, res)
    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Server configuration error' })
  })

  it('returns 400 for invalid payloads', async () => {
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody({ email: 'bad' }) }, res)
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 for non-allowlisted project types', async () => {
    const res = mockRes()
    await handler(
      { method: 'POST', headers: {}, body: validBody({ projectType: 'NotARealType' }) },
      res,
    )
    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Please choose a valid project type.' })
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions without inserting', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: {},
        body: validBody({ website: 'http://bot.example' }),
      },
      res,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true })
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('inserts a valid enquiry without returning a row id', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.9',
          'user-agent': 'vitest',
        },
        body: validBody({ source: 'spoofed' }),
      },
      res,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true })
    expect(res.body).not.toHaveProperty('id')
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

    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody() }, res)
    expect(res.statusCode).toBe(429)
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

    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody() }, res)
    expect(res.statusCode).toBe(503)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    insertMock.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody() }, res)
    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Server error' })
  })
})
