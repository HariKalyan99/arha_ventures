import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  EMAIL_LIMIT,
  IP_LIMIT,
  LEAD_MAGNET_GUIDE,
  applyCors,
  enforceRateLimits,
  getClientIp,
  parseRequestBody,
  validateInquiryPayload,
  validateLeadMagnetPayload,
} from './inquiry-security'

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

describe('parseRequestBody', () => {
  it('parses object bodies', () => {
    expect(parseRequestBody({ name: 'A' })).toEqual({ name: 'A' })
  })

  it('parses JSON strings', () => {
    expect(parseRequestBody('{"name":"A"}')).toEqual({ name: 'A' })
  })

  it('returns empty object for empty input', () => {
    expect(parseRequestBody(undefined)).toEqual({})
    expect(parseRequestBody('')).toEqual({})
  })

  it('throws on invalid JSON strings', () => {
    expect(() => parseRequestBody('{bad')).toThrow()
  })
})

describe('validateInquiryPayload', () => {
  it('accepts a complete enquiry', () => {
    const result = validateInquiryPayload(validBody())
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.email).toBe('hari@example.com')
      expect(result.data.projectType).toBe('Villa')
      expect(result.data.source).toBe('website')
    }
  })

  it('normalises email to lowercase', () => {
    const result = validateInquiryPayload(validBody({ email: 'Hari@Example.COM' }))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.email).toBe('hari@example.com')
  })

  it('forces source to website even if client sends another value', () => {
    const result = validateInquiryPayload(validBody({ source: 'attacker_source' }))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.source).toBe('website')
  })

  it('rejects short names', () => {
    const result = validateInquiryPayload(validBody({ name: 'A' }))
    expect(result).toEqual({ ok: false, error: 'Please tell us your name.' })
  })

  it('rejects invalid emails', () => {
    const result = validateInquiryPayload(validBody({ email: 'not-an-email' }))
    expect(result).toEqual({ ok: false, error: 'Please enter a valid email address.' })
  })

  it('rejects invalid phones when provided', () => {
    const result = validateInquiryPayload(validBody({ phone: 'abc' }))
    expect(result).toEqual({ ok: false, error: 'Please use digits, spaces and + only.' })
  })

  it('allows empty phone', () => {
    const result = validateInquiryPayload(validBody({ phone: '' }))
    expect(result.ok).toBe(true)
  })

  it('rejects missing project type', () => {
    const result = validateInquiryPayload(validBody({ projectType: '' }))
    expect(result).toEqual({ ok: false, error: 'Please choose the type of project.' })
  })

  it('rejects project types outside the allowlist', () => {
    const result = validateInquiryPayload(validBody({ projectType: 'TotallyMadeUpType!!!' }))
    expect(result).toEqual({ ok: false, error: 'Please choose a valid project type.' })
  })

  it('rejects short messages', () => {
    const result = validateInquiryPayload(validBody({ message: 'Too short' }))
    expect(result.ok).toBe(false)
    if (!result.ok && 'error' in result) {
      expect(result.error).toContain('20 characters')
    }
  })

  it('truncates overlong fields', () => {
    const result = validateInquiryPayload(
      validBody({
        name: 'A'.repeat(500),
        message: 'm'.repeat(10000),
      }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toHaveLength(100)
      expect(result.data.message).toHaveLength(5000)
    }
  })

  it('treats filled honeypot as soft success path', () => {
    const result = validateInquiryPayload(validBody({ website: 'https://spam.example' }))
    expect(result).toEqual({ ok: false, honeypot: true })
  })
})

describe('validateLeadMagnetPayload', () => {
  it('accepts name and email and maps to lead_magnet source', () => {
    const result = validateLeadMagnetPayload({
      name: 'Hari',
      email: 'Hari@Example.com',
      guide: '../../../etc/passwd',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.email).toBe('hari@example.com')
      expect(result.data.source).toBe('lead_magnet')
      expect(result.data.projectType).toBe('Lead magnet')
      expect(result.data.message).toBe(`Lead magnet request — ${LEAD_MAGNET_GUIDE}`)
      expect(result.data.message).not.toContain('etc/passwd')
    }
  })

  it('rejects short names', () => {
    expect(validateLeadMagnetPayload({ name: 'A', email: 'a@b.co' })).toEqual({
      ok: false,
      error: 'Please tell us your name.',
    })
  })

  it('trips honeypot', () => {
    expect(
      validateLeadMagnetPayload({
        name: 'Bot',
        email: 'bot@example.com',
        website: 'http://spam',
      }),
    ).toEqual({ ok: false, honeypot: true })
  })
})

describe('applyCors / getClientIp', () => {
  const headers: Record<string, string> = {}
  const res = {
    setHeader(name: string, value: string) {
      headers[name] = value
    },
  }

  beforeEach(() => {
    for (const key of Object.keys(headers)) delete headers[key]
    delete process.env.ALLOWED_ORIGINS
    delete process.env.PUBLIC_BASE_URL
    delete process.env.VERCEL_URL
  })

  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS
    delete process.env.PUBLIC_BASE_URL
    delete process.env.VERCEL_URL
  })

  it('allows localhost origins', () => {
    const ok = applyCors({ headers: { origin: 'http://localhost:5173' } }, res)
    expect(ok).toBe(true)
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173')
  })

  it('allows same-origin requests with no Origin header', () => {
    expect(applyCors({ headers: {} }, res)).toBe(true)
  })

  it('rejects unknown origins', () => {
    expect(applyCors({ headers: { origin: 'https://evil.example' } }, res)).toBe(false)
  })

  it('allows configured PUBLIC_BASE_URL', () => {
    process.env.PUBLIC_BASE_URL = 'https://arha.example.com/'
    const ok = applyCors({ headers: { origin: 'https://arha.example.com' } }, res)
    expect(ok).toBe(true)
  })

  it('prefers x-vercel-forwarded-for over x-forwarded-for', () => {
    expect(
      getClientIp({
        headers: {
          'x-vercel-forwarded-for': '198.51.100.10',
          'x-forwarded-for': '203.0.113.9, 10.0.0.1',
        },
      }),
    ).toBe('198.51.100.10')
  })

  it('falls back to the first forwarded IP', () => {
    expect(
      getClientIp({
        headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
      }),
    ).toBe('203.0.113.9')
  })
})

describe('enforceRateLimits', () => {
  function mockSupabase(counts: Record<string, number>) {
    return {
      from: () => ({
        select: () => ({
          eq: (column: string, value: string) => ({
            gte: async () => {
              const key = `${column}:${value}`
              return { count: counts[key] ?? 0, error: null }
            },
          }),
        }),
      }),
    }
  }

  it('allows submissions under the email and IP caps', async () => {
    const result = await enforceRateLimits({
      email: 'hari@example.com',
      clientIp: '203.0.113.9',
      supabase: mockSupabase({
        'email:hari@example.com': EMAIL_LIMIT - 1,
        'client_ip:203.0.113.9': IP_LIMIT - 1,
      }),
    })
    expect(result).toEqual({ ok: true })
  })

  it('blocks when the email cap is reached', async () => {
    const result = await enforceRateLimits({
      email: 'hari@example.com',
      clientIp: '203.0.113.9',
      supabase: mockSupabase({
        'email:hari@example.com': EMAIL_LIMIT,
        'client_ip:203.0.113.9': 0,
      }),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(429)
      expect(result.error).toMatch(/email/i)
    }
  })

  it('blocks when the IP cap is reached', async () => {
    const result = await enforceRateLimits({
      email: 'hari@example.com',
      clientIp: '203.0.113.9',
      supabase: mockSupabase({
        'email:hari@example.com': 0,
        'client_ip:203.0.113.9': IP_LIMIT,
      }),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(429)
      expect(result.error).toMatch(/Too many requests/i)
    }
  })

  it('fails closed when the rate-limit lookup errors', async () => {
    const result = await enforceRateLimits({
      email: 'hari@example.com',
      clientIp: '203.0.113.9',
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              gte: async () => ({ count: null, error: { message: 'boom' } }),
            }),
          }),
        }),
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(503)
      expect(result.error).toMatch(/Unable to process/i)
    }
  })

  it('skips IP counting for unknown clients', async () => {
    const from = vi.fn(() => ({
      select: () => ({
        eq: (column: string) => ({
          gte: async () => {
            if (column === 'client_ip') throw new Error('should not query IP')
            return { count: 0, error: null }
          },
        }),
      }),
    }))
    const result = await enforceRateLimits({
      email: 'hari@example.com',
      clientIp: 'unknown',
      supabase: { from },
    })
    expect(result).toEqual({ ok: true })
    expect(from).toHaveBeenCalledTimes(1)
  })
})
