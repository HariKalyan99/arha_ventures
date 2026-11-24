export const LEAD_MAGNET_GUIDE = 'Five questions before you begin a home interiors project'
export const LEAD_MAGNET_ENDPOINT = import.meta.env.VITE_LEAD_MAGNET_ENDPOINT || '/api/lead-magnet'

export type LeadMagnetPayload = {
  name: string
  email: string
  /** Honeypot — leave empty. */
  website?: string
}

export type LeadMagnetResult =
  | { status: 'sent' }
  | { status: 'error'; message: string }

export async function submitLeadMagnet(payload: LeadMagnetPayload): Promise<LeadMagnetResult> {
  try {
    const response = await fetch(LEAD_MAGNET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        website: payload.website ?? '',
        source: 'lead_magnet',
      }),
    })

    if (response.status === 429) {
      let detail = 'Too many submissions. Please try again later.'
      try {
        const json = (await response.json()) as { error?: string }
        if (json.error) detail = json.error
      } catch {
        /* keep default */
      }
      return { status: 'error', message: detail }
    }

    if (!response.ok) {
      let detail = `The server responded with ${response.status}.`
      try {
        const json = (await response.json()) as { error?: string }
        if (json.error) detail = json.error
      } catch {
        /* keep default */
      }
      return { status: 'error', message: detail }
    }

    return { status: 'sent' }
  } catch {
    return { status: 'error', message: 'Could not submit right now. Please try again.' }
  }
}
