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

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request('https://arha-ventures.vercel.app/api/lead-magnet', {
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

describe('POST /api/lead-magnet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
    insertMock.mockResolvedValue({ data: null, error: null })
  })

  it('inserts a name + email lead with server-owned guide copy', async () => {
    const res = await handler(
      makeRequest(
        'POST',
        {
          name: 'Hari',
          email: 'hari@example.com',
          guide: '../../../etc/passwd',
          website: '',
        },
        { 'x-forwarded-for': '203.0.113.9' },
      ),
    )
    const body = await readJson(res)
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true })
    expect(body).not.toHaveProperty('id')
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
    const res = await handler(makeRequest('POST', { name: 'Hari', email: 'bad' }))
    expect(res.status).toBe(400)
  })

  it('silently accepts honeypot fills', async () => {
    const res = await handler(
      makeRequest('POST', { name: 'Bot', email: 'bot@example.com', website: 'http://spam' }),
    )
    expect(res.status).toBe(200)
    expect(await readJson(res)).toEqual({ success: true })
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

    const res = await handler(
      makeRequest('POST', { name: 'Hari', email: 'hari@example.com', website: '' }),
    )
    expect(res.status).toBe(503)
    expect(insertMock).not.toHaveBeenCalled()
  })
})
