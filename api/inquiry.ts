/**
 * Vercel Edge enquiry endpoint.
 * Stores rows in Supabase `inquiries`. No email. No Redis.
 */
import { createClient } from '@supabase/supabase-js'
import {
  applyCorsHeaders,
  enforceRateLimits,
  getClientIpFromHeaders,
  isOriginAllowed,
  parseRequestBody,
  validateInquiryPayload,
} from './lib/inquiry-security'

export const config = {
  runtime: 'edge',
}

function json(status: number, body: unknown, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

export default async function handler(req: Request) {
  const cors = new Headers()
  const corsAllowed = applyCorsHeaders(req, cors)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: corsAllowed ? 200 : 403, headers: cors })
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' }, cors)
  }
  if (!corsAllowed || !isOriginAllowed(req)) {
    return json(403, { error: 'Origin not allowed' }, cors)
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return json(500, { error: 'Server configuration error' }, cors)
    }

    let body: Record<string, unknown>
    try {
      const raw = await req.text()
      body = parseRequestBody(raw || {})
    } catch {
      return json(400, { error: 'Invalid JSON body' }, cors)
    }

    const validation = validateInquiryPayload(body)
    if (!validation.ok) {
      if ('honeypot' in validation && validation.honeypot) {
        return json(200, { success: true }, cors)
      }
      return json(400, { error: 'error' in validation ? validation.error : 'Invalid request' }, cors)
    }

    const data = validation.data
    const clientIp = getClientIpFromHeaders(req.headers)
    const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 300)

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const rateLimit = await enforceRateLimits({ email: data.email, clientIp, supabase })
    if (!rateLimit.ok) {
      return json(rateLimit.status, { error: rateLimit.error }, cors)
    }

    const { error } = await supabase.from('inquiries').insert([
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        project_type: data.projectType,
        location: data.location,
        budget: data.budget,
        message: data.message,
        source: data.source,
        client_ip: clientIp,
        user_agent: userAgent,
      },
    ])

    if (error) {
      console.error('Supabase insert failed:', error.message)
      return json(500, { error: 'Server error' }, cors)
    }

    return json(200, { success: true }, cors)
  } catch (err) {
    console.error('Server error:', err)
    return json(500, { error: 'Server error' }, cors)
  }
}
