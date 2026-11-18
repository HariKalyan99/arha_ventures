import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Mail } from 'lucide-react'
import { inquiry, studio } from '../../data/site'
import { buildMailto, submitInquiry, type InquiryPayload } from '../../lib/inquiry'
import { EASE_LUXE } from '../../lib/motion'
import { ArrowButton } from '../ui/ArrowButton'

type Field = keyof InquiryPayload | 'consent'
type Errors = Partial<Record<Field, string>>
type Status = 'idle' | 'submitting' | 'sent' | 'not-configured' | 'error'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: InquiryPayload, consent: boolean): Errors {
  const errors: Errors = {}
  if (values.name.trim().length < 2) errors.name = 'Please tell us your name.'
  if (!EMAIL.test(values.email.trim())) errors.email = 'Please enter a valid email address.'
  if (values.phone && !/^[+()\d\s.-]{6,}$/.test(values.phone.trim())) errors.phone = 'Please use digits, spaces and + only.'
  if (!values.projectType) errors.projectType = 'Please choose the type of project.'
  if (values.message.trim().length < 20) errors.message = 'A few sentences about the project help us prepare (20 characters minimum).'
  if (!consent) errors.consent = 'Please confirm we may use these details to reply.'
  return errors
}

function initialMessage(params: URLSearchParams) {
  const palette = params.get('palette')
  const project = params.get('project')
  if (palette) return `I composed this palette in the Atelier and would like to discuss it:\n${palette.split('; ').join('\n')}\n\n`
  if (project) return `I was looking at “${project}” and would like to discuss a similar project.\n\n`
  return ''
}

function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  className = '',
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="eyebrow text-cream/60">
        {label}
        {required ? <span className="text-gold"> *</span> : <span className="normal-case tracking-normal text-cream/35"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-cream/45">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function InquiryForm() {
  const uid = useId()
  const id = (f: Field) => `${uid}-${f}`
  const [params] = useSearchParams()
  const [values, setValues] = useState<InquiryPayload>(() => ({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    location: '',
    budget: inquiry.budgets[0],
    message: initialMessage(params),
  }))
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const form = useRef<HTMLFormElement>(null)

  const update = <K extends keyof InquiryPayload>(key: K, value: InquiryPayload[K]) => {
    const next = { ...values, [key]: value }
    setValues(next)
    if (submitted) setErrors(validate(next, consent))
  }

  const describedBy = (f: Field, hint = false) => (errors[f] ? `${id(f)}-error` : hint ? `${id(f)}-hint` : undefined)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(values, consent)
    setErrors(found)
    const first = Object.keys(found)[0] as Field | undefined
    if (first) {
      const target = form.current?.querySelector<HTMLElement>(`[name="${first}"]`)
      target?.focus()
      return
    }
    setStatus('submitting')
    const result = await submitInquiry(values)
    if (result.status === 'error') setServerError(result.message)
    setStatus(result.status)
  }

  const errorCount = Object.keys(errors).length

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE_LUXE }}
        role="status"
        className="flex flex-col items-start gap-6 border border-gold/40 p-8 sm:p-12"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-gold text-gold">
          <Check className="size-5" strokeWidth={1.25} aria-hidden />
        </span>
        <h3 className="display text-display-md text-cream">
          Thank you, <em>{values.name.split(' ')[0]}.</em>
        </h3>
        <p className="max-w-md text-cream/75">Your enquiry has been received. We read every message personally and will reply by email.</p>
      </motion.div>
    )
  }

  return (
    <form ref={form} noValidate onSubmit={onSubmit} aria-describedby={`${uid}-required`} className="flex flex-col gap-10">
      <p id={`${uid}-required`} className="text-xs text-cream/50">
        Fields marked <span className="text-gold">*</span> are required.
      </p>

      <div aria-live="assertive" className="empty:hidden">
        {submitted && errorCount > 0 && (
          <p className="border-l-2 border-danger pl-4 text-sm text-cream">
            {errorCount === 1 ? 'One field needs attention.' : `${errorCount} fields need attention.`}
          </p>
        )}
      </div>

      <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">
        <FieldShell id={id('name')} label="Name" required error={errors.name}>
          <input
            id={id('name')}
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy('name')}
            aria-required
            className="field-input"
          />
        </FieldShell>
        <FieldShell id={id('email')} label="Email" required error={errors.email}>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy('email')}
            aria-required
            className="field-input"
          />
        </FieldShell>
        <FieldShell id={id('phone')} label="Phone" error={errors.phone}>
          <input
            id={id('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy('phone')}
            className="field-input"
          />
        </FieldShell>
        <FieldShell id={id('location')} label="Project location" hint="City or region is enough">
          <input
            id={id('location')}
            name="location"
            autoComplete="address-level2"
            value={values.location}
            onChange={(e) => update('location', e.target.value)}
            aria-describedby={describedBy('location', true)}
            className="field-input"
          />
        </FieldShell>
      </div>

      <fieldset aria-describedby={errors.projectType ? `${id('projectType')}-error` : undefined}>
        <legend className="eyebrow text-cream/60">
          Project type<span className="text-gold"> *</span>
        </legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {inquiry.projectTypes.map((type) => (
            <label key={type} className="cursor-pointer">
              <input
                type="radio"
                name="projectType"
                value={type}
                checked={values.projectType === type}
                onChange={() => update('projectType', type)}
                aria-invalid={!!errors.projectType}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center border border-cream/20 px-4 text-sm text-cream/75 transition-colors duration-500 peer-checked:border-gold peer-checked:bg-gold peer-checked:text-obsidian peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold hover:border-cream/50">
                {type}
              </span>
            </label>
          ))}
        </div>
        {errors.projectType && (
          <p id={`${id('projectType')}-error`} className="mt-3 text-xs text-danger">
            {errors.projectType}
          </p>
        )}
      </fieldset>

      <FieldShell id={id('budget')} label="Indicative budget" className="sm:max-w-sm">
        <select id={id('budget')} name="budget" value={values.budget} onChange={(e) => update('budget', e.target.value)} className="field-input">
          {inquiry.budgets.map((b) => (
            <option key={b} value={b} className="bg-obsidian">
              {b}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell id={id('message')} label="About the project" required error={errors.message} hint="Scope, timing, what matters most to you.">
        <textarea
          id={id('message')}
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => update('message', e.target.value)}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy('message', true)}
          aria-required
          className="field-input resize-y"
        />
      </FieldShell>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-cream/75">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked)
              if (submitted) setErrors(validate(values, e.target.checked))
            }}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${id('consent')}-error` : undefined}
            className="mt-1 size-4 shrink-0 accent-[var(--color-gold)]"
          />
          <span>
            I agree that {studio.legalName} may use these details to respond to my enquiry, as described in the{' '}
            <Link to="/privacy" className="link-line text-cream">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id={`${id('consent')}-error`} className="pl-7 text-xs text-danger">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <ArrowButton type="submit" variant="solid" disabled={status === 'submitting'} aria-describedby={`${uid}-status`}>
            {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
          </ArrowButton>
        </div>

        <div id={`${uid}-status`} aria-live="polite">
          <AnimatePresence>
            {status === 'not-configured' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.7, ease: EASE_LUXE }}
                className="overflow-hidden"
              >
                <div className="flex flex-col items-start gap-4 border border-gold/40 p-6">
                  <p className="text-sm text-cream">
                    <strong className="font-medium">Your enquiry has not been sent.</strong> Online submissions aren’t connected on this site yet. You can send
                    the same details from your own email app instead.
                  </p>
                  <a
                    href={buildMailto(values)}
                    className="eyebrow inline-flex min-h-11 items-center gap-2 border border-gold/60 px-4 text-cream transition-colors duration-500 hover:bg-gold hover:text-obsidian"
                  >
                    <Mail className="size-4" strokeWidth={1.25} aria-hidden />
                    Open in email app
                  </a>
                  {studio.contactIsPlaceholder && (
                    <p className="text-xs text-cream/50">Note: the studio email address on this site is still a placeholder and must be replaced before launch.</p>
                  )}
                </div>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-l-2 border-danger pl-4 text-sm text-cream"
              >
                {serverError} Your details are still in the form — please try again, or{' '}
                <a href={buildMailto(values)} className="link-line">
                  send by email
                </a>
                .
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  )
}
