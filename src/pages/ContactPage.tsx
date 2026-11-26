import { useRef } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { InquiryForm } from '../components/contact/InquiryForm'
import { StudioMap } from '../components/contact/StudioMap'
import { Particles } from '../components/bencho/particles/Particles'
import { ArrowExternalLink } from '../components/ui/ArrowButton'
import { studio, whatsappHref } from '../data/site'
import { useReveal } from '../animations/reveal'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ContactPage() {
  usePageMeta('Contact', 'Begin a conversation about your residence, villa, hospitality or workplace project.')
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  const details = [
    { label: 'Email', value: studio.email, href: `mailto:${studio.email}` },
    { label: 'Telephone', value: studio.phone, href: `tel:${studio.phone.replace(/[^+\d]/g, '')}` },
    { label: 'Studio', value: studio.location },
    { label: 'Hours', value: studio.hours },
  ]

  return (
    <>
      <PageHeader
        index="01"
        label="Contact"
        title={['Begin with', <>a <em>conversation.</em></>]}
        intro={
          <div className="flex flex-col items-start gap-6">
            <div className="w-full max-w-[min(100%,20rem)] self-start" aria-hidden>
              <Particles shape="Circle" grain="Fine" reach={80} force={60} />
            </div>
            <p>
              Tell us about the space, the way you want to live in it and the timing you have in mind. We reply to every
              enquiry personally.
            </p>
          </div>
        }
      />
      <section ref={ref} aria-label="Enquiry" className="bg-obsidian pb-[var(--section-y)]">
        <div className="shell grid gap-12 sm:gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <InquiryForm />
          </div>
          <aside aria-label="Studio details" className="min-w-0 lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-8 sm:gap-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <dl className="flex flex-col border-t border-line">
                {details.map((d) => (
                  <div key={d.label} data-reveal="fade" className="flex flex-col gap-1 border-b border-line py-5">
                    <dt className="eyebrow text-cream/50">{d.label}</dt>
                    <dd className="text-cream">
                      {d.label === 'Telephone' || (d.href && !studio.contactIsPlaceholder) ? (
                        <a href={d.href} className="link-line">
                          {d.value}
                        </a>
                      ) : (
                        d.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <div data-reveal="fade" className="flex w-full flex-col items-stretch gap-3 sm:items-start">
                <ArrowExternalLink
                  href={whatsappHref()}
                  variant="solid"
                  className="w-full justify-center sm:w-auto"
                  aria-label={`Connect over WhatsApp at ${studio.phone}`}
                >
                  Connect over WhatsApp
                </ArrowExternalLink>
                <p className="text-xs text-cream/45">Opens a chat with a short introduction ready to send.</p>
              </div>
              <StudioMap />
              {studio.contactIsPlaceholder && (
                <p data-reveal="fade" className="border-l border-gold/50 pl-4 text-sm text-gold/90">
                  Studio email is still a placeholder and will be replaced before launch. Address and telephone are current.
                </p>
              )}
              <div data-reveal="fade">
                <p className="eyebrow text-cream/50">What happens next</p>
                <ol className="mt-5 flex flex-col gap-4 text-sm text-cream/75">
                  <li className="flex gap-4">
                    <span className="text-gold">01</span>We read your enquiry and reply by email.
                  </li>
                  <li className="flex gap-4">
                    <span className="text-gold">02</span>An introductory call to understand the brief.
                  </li>
                  <li className="flex gap-4">
                    <span className="text-gold">03</span>A site visit and a written proposal.
                  </li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
