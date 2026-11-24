/** Shared validation / CORS / rate-limit helpers for the enquiry API. No Redis. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s.-]{6,}$/

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

export const EMAIL_LIMIT = 3
export const EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000
export const IP_LIMIT = 10
export const IP_WINDOW_MS = 60 * 60 * 1000

export type InquiryBody = {
  name: string
  email: string
  phone: string
  projectType: string
  location: string
  budget: string
  message: string
  source: string
  /** Honeypot — must stay empty for humans. */
  website: string
}

export type ValidationOk = { ok: true; data: InquiryBody }
export type ValidationFail =
  | { ok: false; error: string }
  | { ok: false; honeypot: true }

type HeaderBag = Record<string, string | string[] | undefined>

function headerValue(headers: HeaderBag, name: string): string {
  const raw = headers[name] ?? headers[name.toLowerCase()]
  if (Array.isArray(raw)) return raw[0] ?? ''
  return typeof raw === 'string' ? raw : ''
}

export function getAllowedOrigins(): Set<string> {
  const origins = new Set(DEFAULT_ORIGINS)
  if (process.env.PUBLIC_BASE_URL) {
    origins.add(process.env.PUBLIC_BASE_URL.replace(/\/$/, ''))
  }
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '')}`)
  }
  for (const origin of (process.env.ALLOWED_ORIGINS || '').split(',')) {
    const trimmed = origin.trim()
    if (trimmed) origins.add(trimmed)
  }
  return origins
}

export function applyCors(
  req: { headers: HeaderBag },
  res: { setHeader: (name: string, value: string) => void },
): boolean {
  const origin = headerValue(req.headers, 'origin')
  const allowed = getAllowedOrigins()

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    return true
  }

  /* Same-origin browser posts and server-to-server calls omit Origin. */
  if (!origin) return true
  return false
}

export function getClientIp(req: { headers: HeaderBag; socket?: { remoteAddress?: string } }): string {
  const forwarded = headerValue(req.headers, 'x-forwarded-for') || headerValue(req.headers, 'x-real-ip')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return req.socket?.remoteAddress || 'unknown'
}

export function parseRequestBody(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === 'string') {
    if (!raw.trim()) return {}
    return JSON.parse(raw) as Record<string, unknown>
  }
  return {}
}

function asString(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export function validateInquiryPayload(body: Record<string, unknown>): ValidationOk | ValidationFail {
  const website = asString(body.website, 200)
  if (website) return { ok: false, honeypot: true }

  const name = asString(body.name, 100)
  const email = asString(body.email, 254).toLowerCase()
  const phone = asString(body.phone, 40)
  const projectType = asString(body.projectType, 80)
  const location = asString(body.location, 120)
  const budget = asString(body.budget, 60)
  const message = asString(body.message, 5000)
  const source = asString(body.source, 40) || 'website'

  if (name.length < 2) return { ok: false, error: 'Please tell us your name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email address.' }
  if (phone && !PHONE_RE.test(phone)) return { ok: false, error: 'Please use digits, spaces and + only.' }
  if (!projectType) return { ok: false, error: 'Please choose the type of project.' }
  if (message.length < 20) {
    return { ok: false, error: 'A few sentences about the project help us prepare (20 characters minimum).' }
  }

  return {
    ok: true,
    data: { name, email, phone, projectType, location, budget, message, source, website: '' },
  }
}

/** Name + email only — stored in `inquiries` with source `lead_magnet`. */
export function validateLeadMagnetPayload(body: Record<string, unknown>): ValidationOk | ValidationFail {
  const website = asString(body.website, 200)
  if (website) return { ok: false, honeypot: true }

  const name = asString(body.name, 100)
  const email = asString(body.email, 254).toLowerCase()
  const guide = asString(body.guide, 200) || 'Planning guide'

  if (name.length < 2) return { ok: false, error: 'Please tell us your name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email address.' }

  return {
    ok: true,
    data: {
      name,
      email,
      phone: '',
      projectType: 'Lead magnet',
      location: '',
      budget: '',
      message: `Lead magnet request — ${guide}`,
      source: 'lead_magnet',
      website: '',
    },
  }
}

type CountClient = {
  from: (table: string) => {
    select: (
      columns: string,
      options: { count: 'exact'; head: boolean },
    ) => {
      eq: (column: string, value: string) => {
        gte: (
          column: string,
          value: string,
        ) => Promise<{ count: number | null; error: { message: string } | null }>
      }
    }
  }
}

async function countRecent(
  supabase: CountClient,
  column: string,
  value: string,
  windowMs: number,
): Promise<number> {
  const since = new Date(Date.now() - windowMs).toISOString()
  const { count, error } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', since)

  if (error) {
    console.error('Rate-limit lookup failed:', error.message)
    return 0
  }
  return count ?? 0
}

export async function enforceRateLimits({
  email,
  clientIp,
  supabase,
}: {
  email: string
  clientIp: string
  supabase: CountClient
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const emailCount = await countRecent(supabase, 'email', email, EMAIL_WINDOW_MS)
  if (emailCount >= EMAIL_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: 'Too many submissions for this email. Please try again later.',
    }
  }

  if (clientIp && clientIp !== 'unknown') {
    const ipCount = await countRecent(supabase, 'client_ip', clientIp, IP_WINDOW_MS)
    if (ipCount >= IP_LIMIT) {
      return {
        ok: false,
        status: 429,
        error: 'Too many requests. Please try again later.',
      }
    }
  }

  return { ok: true }
}
