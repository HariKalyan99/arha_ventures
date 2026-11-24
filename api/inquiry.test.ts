import { beforeEach, describe, expect, it, vi } from 'vitest'

const insertSelect = vi.fn()
const fromMock = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      gte: vi.fn(async () => ({ count: 0, error: null })),
    })),
  })),
  insert: vi.fn(() => ({
    select: insertSelect,
  })),
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
    insertSelect.mockResolvedValue({ data: [{ id: 'inq_123' }], error: null })
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

  it('inserts a valid enquiry and returns the id', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.9',
          'user-agent': 'vitest',
        },
        body: validBody(),
      },
      res,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true, id: 'inq_123' })
    expect(fromMock).toHaveBeenCalledWith('inquiries')
  })

  it('returns 429 when the email rate limit is hit', async () => {
    fromMock.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(async () => ({ count: 3, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: insertSelect,
      })),
    }))

    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody() }, res)
    expect(res.statusCode).toBe(429)
    expect(insertSelect).not.toHaveBeenCalled()
  })

  it('returns 500 when Supabase insert fails', async () => {
    insertSelect.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: validBody() }, res)
    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Server error' })
  })
})
