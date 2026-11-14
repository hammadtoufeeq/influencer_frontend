import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import TopLink from './nav/TopLink'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faTiktok,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { faArrowUp, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { CONTACT_EMAIL, PLATFORM_NAME, SOCIAL_LINKS } from '../constants/config'
import { useAuth } from '../hooks/useAuth'

const currentYear = new Date().getFullYear()

const SOCIALS: {
  key: keyof typeof SOCIAL_LINKS
  label: string
  icon: IconDefinition
  bg: string
}[] = [
  { key: 'instagram', label: 'Instagram', icon: faInstagram, bg: 'bg-pink-600' },
  { key: 'x', label: 'X', icon: faXTwitter, bg: 'bg-black' },
  { key: 'linkedin', label: 'LinkedIn', icon: faLinkedinIn, bg: 'bg-blue-700' },
  { key: 'youtube', label: 'YouTube', icon: faYoutube, bg: 'bg-red-600' },
  { key: 'facebook', label: 'Facebook', icon: faFacebookF, bg: 'bg-blue-600' },
  { key: 'tiktok', label: 'TikTok', icon: faTiktok, bg: 'bg-black' },
]

interface FooterLink {
  label: string
  to?: string
  href?: string
}

// Decorative vector shapes for the footer background
function FooterShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Glow, top-left */}
      <div className="absolute -start-24 -top-24 h-64 w-64 rounded-full bg-brand-violet/15 blur-3xl sm:h-96 sm:w-96" />

      {/* Concentric rings, top-right */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className="absolute -end-16 -top-16 h-48 w-48 text-brand-violet/25 sm:-end-20 sm:-top-20 sm:h-72 sm:w-72"
      >
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="64" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="34" fill="currentColor" />
      </svg>

      {/* Dotted grid, left middle */}
      <svg
        viewBox="0 0 120 120"
        className="absolute start-3 top-[38%] hidden h-24 w-24 text-white/15 sm:block md:h-32 md:w-32"
      >
        <defs>
          <pattern id="footer-dots-a" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="120" height="120" fill="url(#footer-dots-a)" />
      </svg>

      {/* Triangle outline, right middle */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className="absolute end-[6%] top-[46%] h-10 w-10 rotate-12 text-[#FF7A00]/30 sm:h-14 sm:w-14"
      >
        <path d="M50 8 L94 88 L6 88 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>

      {/* Plus signs */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="absolute start-[30%] top-10 hidden h-5 w-5 text-white/25 md:block"
      >
        <path d="M20 4 V36 M4 20 H36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="absolute end-[28%] bottom-24 h-5 w-5 text-brand-violet/50 sm:h-6 sm:w-6"
      >
        <path d="M20 4 V36 M4 20 H36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Soft blob, bottom-left */}
      <svg
        viewBox="0 0 200 200"
        className="absolute -bottom-20 -start-20 h-56 w-56 text-brand-violet/15 sm:h-80 sm:w-80"
      >
        <path
          fill="currentColor"
          d="M44.7,-58.4C57.4,-48.6,66.3,-33.6,70.6,-17.3C74.9,-1,74.6,16.7,67.1,30.6C59.6,44.5,44.9,54.6,29.1,61.1C13.3,67.6,-3.6,70.5,-19.6,66.5C-35.6,62.5,-50.7,51.6,-60.5,37.2C-70.3,22.8,-74.8,4.9,-71.3,-10.9C-67.8,-26.7,-56.3,-40.4,-42.9,-50C-29.5,-59.6,-14.7,-65.1,0.8,-66.1C16.3,-67.1,32,-68.2,44.7,-58.4Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Wave line, near the bottom */}
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-x-0 bottom-16 h-10 w-full text-white/10 sm:h-14"
      >
        <path
          d="M0 40 C100 0 200 80 300 40 C400 0 500 80 600 40 C700 0 800 80 900 40 C1000 0 1100 80 1200 40"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Dotted grid, bottom-right */}
      <svg
        viewBox="0 0 120 120"
        className="absolute bottom-6 end-3 hidden h-24 w-24 text-[#FF7A00]/20 sm:block md:h-32 md:w-32"
      >
        <defs>
          <pattern id="footer-dots-b" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="120" height="120" fill="url(#footer-dots-b)" />
      </svg>
    </div>
  )
}

// Site ke neeche: brand, newsletter, paanch columns ke links, social accounts aur copyright
function Footer() {
  const { t } = useTranslation()
  // Home aur About pe neeche kone wala gol "upar jao" button hai, wahan ye link nahi
  const hasRoundButton = ['/', '/about'].includes(useLocation().pathname)
  const { user } = useAuth()

  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : null
  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.explorePeople'), to: '/search' },
        { label: t('footer.mostFollowed'), to: '/search?sort=followers' },
        { label: t('footer.campaigns'), to: '/campaigns' },
        { label: t('footer.businesses'), to: '/businesses' },
        { label: t('footer.managers'), to: '/managers' },
      ],
    },
    {
      title: t('footer.solutions'),
      links: [
        { label: t('footer.forBrands'), to: home ?? '/register' },
        { label: t('footer.forTalent'), to: home ?? '/search' },
        { label: t('footer.forManagers'), to: home ?? '/register' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), to: '/about' },
        { label: t('footer.contact'), href: `mailto:${CONTACT_EMAIL}` },
        { label: t('footer.reportProblem'), href: `mailto:${CONTACT_EMAIL}?subject=Report` },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), to: '/privacy' },
        { label: t('footer.terms'), to: '/terms' },
      ],
    },
  ]

  const linkClass = 'text-sm text-gray-400 transition hover:text-white'

  return (
    <footer className="keep-dark relative isolate w-full overflow-hidden bg-gray-950 text-gray-300 print:hidden">
      <FooterShapes />
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-8 pt-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + paigham + social + newsletter */}
          <div className="lg:col-span-4">
            <TopLink to="/" className="text-2xl font-bold text-white">
              {PLATFORM_NAME}
            </TopLink>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-400">
              {t('footer.tagline')}
            </p>
            <p className="text-sm text-gray-400">
              {t('footer.description')}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2" aria-label={t('footer.followUs')}>
              {SOCIALS.map((social) => (
                <li key={social.key}>
                  <a
                    href={SOCIAL_LINKS[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className={`group flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${social.bg}`}
                  >
                    <FontAwesomeIcon
                      icon={social.icon}
                      className="transition-transform duration-300 group-hover:scale-125"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <nav
            aria-label={t('footer.siteLinks')}
            className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-8 lg:gap-8"
          >
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <TopLink to={link.to} className={linkClass}>
                          {link.label}
                        </TopLink>
                      ) : (
                        <a href={link.href} className={linkClass}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Email wali patti */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-semibold text-white">{t('footer.contactTitle')}</p>
            <p className="mt-1 text-sm text-gray-400">{t('footer.contactBody')}</p>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition hover:bg-brand-hover"
          >
            <FontAwesomeIcon icon={faEnvelope} />
            <span dir="ltr">{CONTACT_EMAIL}</span>
          </a>
        </div>

        {/* Copyright + upar jao */}
        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-500">
            © {currentYear} {PLATFORM_NAME}. {t('footer.rights')}
          </p>
          {!hasRoundButton && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-xs text-gray-400 transition hover:text-white"
            >
              {t('footer.backToTop')}
              <FontAwesomeIcon icon={faArrowUp} />
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer