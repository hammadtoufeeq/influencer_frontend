import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faCircleCheck, faFileSignature } from '@fortawesome/free-solid-svg-icons'
import { PLATFORM_NAME } from '../../constants/config'

const BG_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=70'

// Platform ki teen khoobiyan (Home ke "Why teams choose us" wale texts)
const POINTS: { icon: IconDefinition; title: string; body: string }[] = [
  { icon: faCircleCheck, title: 'home.b1', body: 'home.b1b' },
  { icon: faChartLine, title: 'home.b2', body: 'home.b2b' },
  { icon: faFileSignature, title: 'home.b3', body: 'home.b3b' },
]

// Login / signup ka left panel: Home ke hero jaisa andhera, heading aur khoobiyan
function AuthShowcase({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children?: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <aside className="keep-dark relative isolate flex flex-col overflow-clip bg-brand-plum px-6 py-7 text-white sm:px-10 sm:py-10 lg:min-h-[660px]">
      {/* Peeche: halki tasveer, roshni ke dhabbe, neeche andhera */}
      <img
        src={BG_IMAGE}
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
      />
      <div className="absolute -start-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl motion-safe:animate-drift" />
      <div
        className="absolute -end-16 -bottom-28 -z-10 h-96 w-96 rounded-full bg-gray-400/20 blur-3xl motion-safe:animate-drift"
        style={{ animationDelay: '-7s' }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-plum via-brand-plum/70 to-brand-plum/30" />

      {/* Lamba form ho to bhi panel ka content scroll ke saath nazar mein rahe */}
      <div className="flex flex-1 flex-col lg:sticky lg:top-24 lg:max-h-[620px] lg:min-h-[580px]">
        <Link to="/" className="flex w-fit items-center gap-2.5">
          <img src="/logo.svg?v=1" alt="" className="h-9 w-9 rounded-full ring-1 ring-white/20" />
          <span className="font-display text-base font-bold tracking-tight">{PLATFORM_NAME}</span>
        </Link>

        <div className="mt-8 lg:my-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase motion-safe:animate-fade-up">
            {eyebrow}
          </p>
          <h1
            className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight motion-safe:animate-fade-up sm:text-4xl lg:text-5xl"
            style={{ animationDelay: '80ms' }}
          >
            {title}
          </h1>
          <p
            className="mt-4 max-w-md text-sm leading-relaxed text-white/75 motion-safe:animate-fade-up sm:text-base"
            style={{ animationDelay: '160ms' }}
          >
            {subtitle}
          </p>
          {children}

          {/* Khoobiyan: sirf bari screen pe (mobile pe form jaldi nazar aaye) */}
          <ul className="mt-10 hidden space-y-5 lg:block">
            {POINTS.map((point, i) => (
              <li
                key={point.title}
                className="flex items-start gap-4 motion-safe:animate-fade-up"
                style={{ animationDelay: `${260 + i * 100}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur">
                  <FontAwesomeIcon icon={point.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{t(point.title)}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-white/65">
                    {t(point.body)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default AuthShowcase
