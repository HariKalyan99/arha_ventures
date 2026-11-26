import { inquiry, studio } from '../data/site'
import { readApiErrorMessage } from './apiError'

export interface InquiryPayload {
  name: string
  email: string
  phone: string
  projectType: string
  location: string
  budget: string
  message: string
  /** Honeypot — leave empty. Bots that fill it are silently discarded server-side. */
  website?: string
}

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'not-configured' }
  | { status: 'error'; message: string }

/**
 * Integration point for enquiries.
 * Defaults to `/api/inquiry` (Vercel serverless → Supabase).
 * Override with VITE_INQUIRY_ENDPOINT when needed.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<SubmitResult> {
  if (!inquiry.endpoint) return { status: 'not-configured' }

  try {
    const response = await fetch(inquiry.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        projectType: payload.projectType,
        location: payload.location,
        budget: payload.budget,
        message: payload.message,
        website: payload.website ?? '',
        source: 'website',
        submittedAt: new Date().toISOString(),
      }),
    })

    if (response.status === 429) {
      let detail = 'Too many submissions. Please try again later.'
      try {
        detail = readApiErrorMessage(await response.json(), detail)
      } catch {
        /* keep default */
      }
      return { status: 'error', message: detail }
    }

    if (!response.ok) {
      let detail = `The server responded with ${response.status}.`
      try {
        detail = readApiErrorMessage(await response.json(), detail)
      } catch {
        /* keep default */
      }
      return { status: 'error', message: detail }
    }

    return { status: 'sent' }
  } catch {
    return { status: 'error', message: 'The enquiry could not reach the server. Please check your connection.' }
  }
}

/** Builds a mailto: link so visitors can still send their enquiry through their own email client. */
export function buildMailto(payload: InquiryPayload): string {
  const details = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone && `Phone: ${payload.phone}`,
    `Project type: ${payload.projectType}`,
    payload.location && `Location: ${payload.location}`,
    payload.budget && `Budget: ${payload.budget}`,
  ].filter(Boolean)
  const body = `${details.join('\n')}\n\n${payload.message}`
  const subject = `Project enquiry — ${payload.projectType}`
  return `mailto:${studio.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
