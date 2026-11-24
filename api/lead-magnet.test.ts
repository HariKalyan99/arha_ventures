import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LEAD_MAGNET_GUIDE } from './lib/inquiry-security'

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

import handler from './lead-magnet'

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

describe('POST /api/lead-magnet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
    insertMock.mockResolvedValue({ data: null, error: null })
  })

  it('inserts a name + email lead with server-owned guide copy', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.9' },
        body: {
          name: 'Hari',
          email: 'hari@example.com',
          guide: '../../../etc/passwd',
          website: '',
        },
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
        project_type: 'Lead magnet',
        source: 'lead_magnet',
        message: `Lead magnet request — ${LEAD_MAGNET_GUIDE}`,
        client_ip: '203.0.113.9',
      }),
    ])
  })

  it('rejects invalid email', async () => {
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: { name: 'Hari', email: 'bad' } }, res)
    expect(res.statusCode).toBe(400)
  })

  it('silently accepts honeypot fills', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: {},
        body: { name: 'Bot', email: 'bot@example.com', website: 'http://spam' },
      },
      res,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true })
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('returns 503 when rate-limit lookup fails', async () => {
    fromMock.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(async () => ({ count: null, error: { message: 'timeout' } })),
        })),
      })),
      insert: insertMock,
    }))

    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: {},
        body: { name: 'Hari', email: 'hari@example.com', website: '' },
      },
      res,
    )
    expect(res.statusCode).toBe(503)
    expect(insertMock).not.toHaveBeenCalled()
  })
})
