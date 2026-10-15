import { useTranslation } from 'react-i18next'
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
import NewsletterForm from './NewsletterForm'

const currentYear = new Date().getFullYear()

const SOCIALS: { key: keyof typeof SOCIAL_LINKS; label: string; icon: IconDefinition }[] = [
  { key: 'instagram', label: 'Instagram', icon: faInstagram },
  { key: 'x', label: 'X', icon: faXTwitter },
  { key: 'linkedin', label: 'LinkedIn', icon: faLinkedinIn },
  { key: 'youtube', label: 'YouTube', icon: faYoutube },
  { key: 'facebook', label: 'Facebook', icon: faFacebookF },
  { key: 'tiktok', label: 'TikTok', icon: faTiktok },
]

interface FooterLink {
  label: string
  to?: string
  href?: string
}

// Site ke neeche: brand, newsletter, paanch columns ke links, social accounts aur copyright
function Footer() {
  const { t } = useTranslation()
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
      title: t('footer.resources'),
      links: [
        { label: t('footer.howItWorks'), to: '/#how-it-works' },
        { label: t('footer.features'), to: '/#features' },
        { label: t('footer.faq'), to: '/#faq' },
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
    <footer className="keep-dark w-full bg-gray-950 text-gray-300 print:hidden">
      <div className="mx-auto w-full max-w-screen-2xl px-4 pb-8 pt-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + paigham + social + newsletter */}
          <div className="lg:col-span-4">
            <TopLink to="/" className="text-2xl font-bold text-white">
              {PLATFORM_NAME}
            </TopLink>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-400">
              {t('footer.tagline')}
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
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5 lg:col-span-8 lg:gap-8"
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
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="font-semibold text-white">{t('footer.contactTitle')}</p>
            <p className="mt-1 text-sm text-gray-400">{t('footer.contactBody')}</p>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-950 transition hover:bg-gray-200"
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
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-xs text-gray-400 transition hover:text-white"
          >
            {t('footer.backToTop')}
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer