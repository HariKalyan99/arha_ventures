/**
 * Vercel serverless lead-magnet endpoint.
 * Stores name + email in Supabase `inquiries` (source: lead_magnet). No email. No Redis.
 */
import { createClient } from '@supabase/supabase-js'
import {
  applyCors,
  enforceRateLimits,
  getClientIp,
  parseRequestBody,
  validateLeadMagnetPayload,
} from './lib/inquiry-security'

type VercelRequest = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  end: () => void
  setHeader: (name: string, value: string) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsAllowed = applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(corsAllowed ? 200 : 403).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!corsAllowed) {
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    let body: Record<string, unknown>
    try {
      body = parseRequestBody(req.body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }

    const validation = validateLeadMagnetPayload(body)
    if (!validation.ok) {
      if ('honeypot' in validation && validation.honeypot) {
        return res.status(200).json({ success: true })
      }
      return res.status(400).json({ error: 'error' in validation ? validation.error : 'Invalid request' })
    }

    const data = validation.data
    const clientIp = getClientIp(req)
    const userAgent = String(req.headers['user-agent'] ?? '').slice(0, 300)

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const rateLimit = await enforceRateLimits({ email: data.email, clientIp, supabase })
    if (!rateLimit.ok) {
      return res.status(rateLimit.status).json({ error: rateLimit.error })
    }

    const { data: rows, error } = await supabase
      .from('inquiries')
      .insert([
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
      .select('id')

    if (error) {
      console.error('Supabase insert failed:', error.message)
      return res.status(500).json({ error: 'Server error' })
    }

    return res.status(200).json({ success: true, id: rows?.[0]?.id ?? null })
  } catch (err) {
    console.error('Server error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
