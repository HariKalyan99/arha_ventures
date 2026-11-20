import { useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUp } from 'lucide-react'
import { legalNavigation, navigation, studio } from '../../data/site'
import { useSmoothScroll } from '../../lib/scroll-context'
import { useReveal } from '../../animations/reveal'
import { Particles } from '../bencho/particles/Particles'
import { ArrowLink } from '../ui/ArrowButton'
import { Lines } from '../ui/Text'

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const { scrollTo } = useSmoothScroll()
  useReveal(ref, [pathname])
  const year = new Date().getFullYear()

  return (
    <footer ref={ref} className="relative overflow-hidden surface-ink">
      {pathname !== '/contact' && !pathname.startsWith('/projects/') && (
        <div className="shell section-y overflow-visible border-b border-line">
          <div className="grid gap-10 overflow-visible lg:grid-cols-12 lg:items-end">
            <p className="eyebrow text-gold lg:col-span-12">Begin</p>
            <h2 className="display text-display-xl text-cream lg:col-span-8">
              <Lines lines={['Have a space', <>in <em>mind?</em></>]} />
            </h2>
            <div data-reveal="fade" className="relative z-10 flex flex-col items-start gap-6 overflow-visible lg:col-span-4">
              <div className="w-full max-w-[min(100%,20rem)] self-start" aria-hidden>
                <Particles shape="Circle" grain="Fine" reach={80} force={60} />
              </div>
              <p className="text-cream/60">
                Tell us about the place, the people who will live in it, and what you hope it will feel like. We reply to every enquiry personally.
              </p>
              <ArrowLink to="/contact" variant="solid" className="self-start">
                Start a project
              </ArrowLink>
            </div>
          </div>
        </div>
      )}

      <div className="shell grid gap-12 py-[clamp(4rem,8vw,7rem)] sm:grid-cols-2 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-4">
          <p className="display text-display-sm text-cream">{studio.descriptor}</p>
          <p className="text-sm text-cream/60">{studio.hours}</p>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-6">
          <p className="eyebrow mb-5 text-gold">Explore</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <li>
              <Link to="/" className="link-line text-cream/80 hover:text-cream">
                Home
              </Link>
            </li>
            {navigation.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-line text-cream/80 hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <p className="eyebrow mb-5 text-gold">Contact</p>
          <ul className="flex flex-col gap-3 text-sm text-cream/80">
            <li>
              <a href={`mailto:${studio.email}`} className="link-line break-all hover:text-cream">
                {studio.email}
              </a>
            </li>
            <li>{studio.phone}</li>
            <li className="text-cream/60">{studio.location}</li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <p className="eyebrow mb-5 text-gold">Follow</p>
          <ul className="flex flex-col gap-3 text-sm">
            {studio.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="link-line text-cream/80 hover:text-cream">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Oversized wordmark — each letter grows / shrinks once on hover */}
      <div className="select-none px-[var(--gutter)]" aria-hidden>
        <p className="footer-mark font-display cursor-default text-[clamp(6rem,30vw,34rem)] leading-[0.72] font-light tracking-[0.08em] text-cream/[0.07]">
          {studio.name.split('').map((char, i) => (
            <span key={`${char}-${i}`} className="footer-mark-letter">
              {char}
            </span>
          ))}
        </p>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-line py-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {studio.legalName}. All rights reserved.
        </p>
        {studio.contactIsPlaceholder && (
          <p className="text-gold/80">Projects, journal entries and studio email are still sample content.</p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {legalNavigation.map((item) => (
            <Link key={item.to} to={item.to} className="link-line hover:text-cream">
              {item.label}
            </Link>
          ))}
          <button type="button" onClick={() => scrollTo(0)} className="group flex min-h-11 items-center gap-2 hover:text-cream">
            Back to top
            <ArrowUp aria-hidden className="size-4 text-gold transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </footer>
  )
}
