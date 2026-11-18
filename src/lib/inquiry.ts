import { inquiry, studio } from '../data/site'

export interface InquiryPayload {
  name: string
  email: string
  phone: string
  projectType: string
  location: string
  budget: string
  message: string
}

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'not-configured' }
  | { status: 'error'; message: string }

/**
 * Integration point for enquiries.
 * Set VITE_INQUIRY_ENDPOINT to any URL that accepts a JSON POST (Formspree, a serverless
 * function, a CRM webhook…). Without it, nothing is sent and the UI says so explicitly.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<SubmitResult> {
  if (!inquiry.endpoint) return { status: 'not-configured' }

  try {
    const response = await fetch(inquiry.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, source: 'website', submittedAt: new Date().toISOString() }),
    })
    if (!response.ok) return { status: 'error', message: `The server responded with ${response.status}.` }
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
