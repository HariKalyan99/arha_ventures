/** Shared validation / CORS / rate-limit helpers for the enquiry API. No Redis. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\d\s.-]{6,}$/

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

/** Keep in sync with `inquiry.projectTypes` in `src/data/site.ts`. */
export const ALLOWED_PROJECT_TYPES = [
  'Private residence',
  'Villa',
  'Apartment / penthouse',
  'Hospitality',
  'Commercial / workplace',
  'Consultation only',
] as const

/** Server-owned copy — do not trust a client `guide` field. */
export const LEAD_MAGNET_GUIDE = 'Five questions before you begin a home interiors project'

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

function addOrigin(origins: Set<string>, value?: string) {
  if (!value) return
  const cleaned = value.trim().replace(/\/$/, '')
  if (!cleaned) return
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    origins.add(cleaned)
    return
  }
  origins.add(`https://${cleaned}`)
}

export function getAllowedOrigins(): Set<string> {
  const origins = new Set(DEFAULT_ORIGINS)
  /* Production alias is often not the same as VERCEL_URL (deployment hostname). */
  addOrigin(origins, process.env.PUBLIC_BASE_URL)
  addOrigin(origins, process.env.VERCEL_URL)
  addOrigin(origins, process.env.VERCEL_BRANCH_URL)
  addOrigin(origins, process.env.VERCEL_PROJECT_PRODUCTION_URL)
  for (const origin of (process.env.ALLOWED_ORIGINS || '').split(',')) {
    addOrigin(origins, origin)
  }
  return origins
}

function headersToMap(headers: Headers | HeaderBag): HeaderBag {
  if (headers instanceof Headers) {
    const map: HeaderBag = {}
    headers.forEach((value, key) => {
      map[key] = value
    })
    return map
  }
  return headers
}

function readOrigin(headers: Headers | HeaderBag): string {
  if (headers instanceof Headers) return headers.get('origin') ?? ''
  return headerValue(headers, 'origin')
}

/** True when browser Origin host matches this request’s host (production alias safe). */
export function isSameOriginRequest(req: Request | { headers: Headers | HeaderBag; url?: string }): boolean {
  const headers = req instanceof Request ? req.headers : headersToMap(req.headers)
  const origin = readOrigin(headers)
  if (!origin) return true

  try {
    const originHost = new URL(origin).host
    if (req instanceof Request) {
      return originHost === new URL(req.url).host
    }
    const host =
      headerValue(headersToMap(req.headers), 'x-forwarded-host') ||
      headerValue(headersToMap(req.headers), 'host')
    if (host) return originHost === host.split(',')[0]?.trim()
    if (req.url) return originHost === new URL(req.url).host
  } catch {
    return false
  }
  return false
}

/** Whether the request Origin is allowlisted (or omitted for same-origin / server calls). */
export function isOriginAllowed(req: { headers: Headers | HeaderBag; url?: string } | Request): boolean {
  const headers = req instanceof Request ? req.headers : headersToMap(req.headers)
  const origin = readOrigin(headers)
  if (!origin) return true
  if (isSameOriginRequest(req)) return true
  return getAllowedOrigins().has(origin)
}

/** Write CORS headers onto a Headers object; returns whether the origin is allowed. */
export function applyCorsHeaders(req: Request | { headers: Headers | HeaderBag; url?: string }, out: Headers): boolean {
  const headers = req instanceof Request ? req.headers : headersToMap(req.headers)
  const origin = readOrigin(headers)
  const allowed = getAllowedOrigins()
  const ok = !origin || isSameOriginRequest(req) || allowed.has(origin)

  out.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  out.set('Access-Control-Allow-Headers', 'Content-Type')
  out.set('Vary', 'Origin')

  if (origin && ok) {
    out.set('Access-Control-Allow-Origin', origin)
    return true
  }

  /* Same-origin browser posts and server-to-server calls omit Origin. */
  return !origin
}

/** @deprecated Prefer applyCorsHeaders for Edge handlers. */
export function applyCors(
  req: { headers: HeaderBag },
  res: { setHeader: (name: string, value: string) => void },
): boolean {
  const headers = new Headers()
  const ok = applyCorsHeaders(req, headers)
  /* Headers API lowercases names — restore the casing Node/tests expect. */
  const origin = headers.get('Access-Control-Allow-Origin')
  res.setHeader('Access-Control-Allow-Methods', headers.get('Access-Control-Allow-Methods') ?? 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', headers.get('Access-Control-Allow-Headers') ?? 'Content-Type')
  res.setHeader('Vary', headers.get('Vary') ?? 'Origin')
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  return ok
}

/**
 * Resolve client IP behind a trusted edge (Vercel).
 * Prefer platform header; fall back to standard proxy headers.
 */
export function getClientIpFromHeaders(headers: Headers | HeaderBag): string {
  const map = headersToMap(headers)
  const vercel = headerValue(map, 'x-vercel-forwarded-for')
  if (vercel) return vercel.split(',')[0]?.trim() || 'unknown'

  const realIp = headerValue(map, 'x-real-ip')
  if (realIp) return realIp.split(',')[0]?.trim() || 'unknown'

  const forwarded = headerValue(map, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'

  return 'unknown'
}

/** @deprecated Prefer getClientIpFromHeaders for Edge handlers. */
export function getClientIp(req: { headers: HeaderBag; socket?: { remoteAddress?: string } }): string {
  const fromHeaders = getClientIpFromHeaders(req.headers)
  if (fromHeaders !== 'unknown') return fromHeaders
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
  /* Ignore client-supplied source — only first-party enquiry form. */
  const source = 'website'

  if (name.length < 2) return { ok: false, error: 'Please tell us your name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please enter a valid email address.' }
  if (phone && !PHONE_RE.test(phone)) return { ok: false, error: 'Please use digits, spaces and + only.' }
  if (!projectType) return { ok: false, error: 'Please choose the type of project.' }
  if (!(ALLOWED_PROJECT_TYPES as readonly string[]).includes(projectType)) {
    return { ok: false, error: 'Please choose a valid project type.' }
  }
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
      message: `Lead magnet request — ${LEAD_MAGNET_GUIDE}`,
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

type CountResult =
  | { ok: true; count: number }
  | { ok: false; message: string }

async function countRecent(
  supabase: CountClient,
  column: string,
  value: string,
  windowMs: number,
): Promise<CountResult> {
  const since = new Date(Date.now() - windowMs).toISOString()
  const { count, error } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq(column, value)
    .gte('created_at', since)

  if (error) {
    console.error('Rate-limit lookup failed:', error.message)
    return { ok: false, message: error.message }
  }
  return { ok: true, count: count ?? 0 }
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
  if (!emailCount.ok) {
    return {
      ok: false,
      status: 503,
      error: 'Unable to process request right now. Please try again.',
    }
  }
  if (emailCount.count >= EMAIL_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: 'Too many submissions for this email. Please try again later.',
    }
  }

  if (clientIp && clientIp !== 'unknown') {
    const ipCount = await countRecent(supabase, 'client_ip', clientIp, IP_WINDOW_MS)
    if (!ipCount.ok) {
      return {
        ok: false,
        status: 503,
        error: 'Unable to process request right now. Please try again.',
      }
    }
    if (ipCount.count >= IP_LIMIT) {
      return {
        ok: false,
        status: 429,
        error: 'Too many requests. Please try again later.',
      }
    }
  }

  return { ok: true }
}
