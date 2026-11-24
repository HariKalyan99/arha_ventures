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
    insertSelect.mockResolvedValue({ data: [{ id: 'lead_1' }], error: null })
  })

  it('inserts a name + email lead with source lead_magnet', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.9' },
        body: {
          name: 'Hari',
          email: 'hari@example.com',
          guide: 'Five questions before you begin a home interiors project',
          website: '',
        },
      },
      res,
    )
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true, id: 'lead_1' })
    expect(fromMock).toHaveBeenCalledWith('inquiries')
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
})
