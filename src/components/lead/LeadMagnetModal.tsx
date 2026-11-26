import { useEffect, useId, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { EASE_LUXE } from '../../lib/motion'
import { LEAD_MAGNET_GUIDE, submitLeadMagnet } from '../../lib/leadMagnet'
import { ArrowButton } from '../ui/ArrowButton'

type Props = {
  onClose: () => void
}

/**
 * Delayed / exit-intent capture — name + email only.
 * Stored via /api/lead-magnet; guide delivery email comes later.
 */
export function LeadMagnetModal({ onClose }: Props) {
  const uid = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentName, setSentName] = useState<string | null>(null)

  useEffect(() => {
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError(null)
    const result = await submitLeadMagnet({ name, email, website })
    if (result.status === 'sent') {
      setSentName(name.trim().split(/\s+/)[0] || 'there')
      setName('')
      setEmail('')
      setWebsite('')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[160] overflow-x-hidden overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex min-h-dvh items-center justify-center py-4 sm:py-8">
        <motion.div
          data-modal-open="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-title`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_LUXE }}
          className="relative w-full max-w-lg overflow-hidden border border-line bg-obsidian p-5 text-cream shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-8 md:p-10"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="absolute right-2 top-2 inline-flex size-11 cursor-pointer items-center justify-center text-cream/55 transition-colors hover:text-cream sm:right-3 sm:top-3"
          >
            <X className="size-4" strokeWidth={1.25} aria-hidden />
          </button>

          {sentName ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_LUXE }}
              role="status"
              className="flex flex-col items-start gap-5 pr-8 sm:gap-6"
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-gold text-gold sm:size-12">
                <Check className="size-5" strokeWidth={1.25} aria-hidden />
              </span>
              <div>
                <p className="eyebrow text-gold">Guide requested</p>
                <h2 id={`${uid}-title`} className="display mt-3 text-display-sm text-cream sm:mt-4 md:text-display-md">
                  Thank you, <em>{sentName}.</em>
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-cream/70 sm:text-base">
                Your request is in. We’ll email <span className="text-cream">“{LEAD_MAGNET_GUIDE}”</span> shortly — keep an eye on your inbox (and spam, just in case).
              </p>
              <ArrowButton type="button" variant="solid" onClick={onClose} className="mt-1 w-full justify-center sm:w-auto">
                Continue browsing
              </ArrowButton>
            </motion.div>
          ) : (
            <>
              <p className="eyebrow text-gold">A short guide</p>
              <h2 id={`${uid}-title`} className="display mt-3 max-w-[16ch] pr-8 text-display-sm text-cream sm:mt-4 md:text-display-md">
                Before you begin.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/60 sm:text-base">{LEAD_MAGNET_GUIDE}</p>

              <form onSubmit={onSubmit} className="relative mt-7 flex flex-col gap-1 sm:mt-8 sm:gap-2">
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
                  <label htmlFor={`${uid}-website`}>Company website</label>
                  <input
                    id={`${uid}-website`}
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <label htmlFor={`${uid}-name`} className="eyebrow mt-2 text-cream/55">
                  Name
                </label>
                <input
                  id={`${uid}-name`}
                  required
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input cursor-text"
                  placeholder="Your name"
                />

                <label htmlFor={`${uid}-email`} className="eyebrow mt-5 text-cream/55">
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input cursor-text"
                  placeholder="you@example.com"
                />

                <div className="mt-6 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <p className="order-2 text-xs leading-relaxed text-cream/45 sm:order-1 sm:max-w-[14rem]">
                    No spam. Practical questions for a clear brief.
                  </p>
                  <ArrowButton
                    type="submit"
                    variant="solid"
                    disabled={loading}
                    data-cursor="hover"
                    className="order-1 w-full cursor-pointer justify-center sm:order-2 sm:w-auto"
                  >
                    {loading ? 'Sending…' : 'Get the guide'}
                  </ArrowButton>
                </div>
              </form>

              {error ? (
                <p role="status" className="mt-5 border-l-2 border-danger pl-4 text-sm text-cream">
                  {error}
                </p>
              ) : null}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
