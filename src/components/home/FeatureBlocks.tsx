import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faChartColumn,
  faCheck,
  faCircleCheck,
  faFileSignature,
  faHandshake,
  faMagnifyingGlass,
  faPaperPlane,
  faShieldHalved,
  faSliders,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../hooks/useAuth'

type FeatureKey = 'discovery' | 'reach' | 'authenticity' | 'outreach' | 'hiring'

// Mock-up ka dabba: app ki chhoti si tasveer (sirf sajawat, screen reader se chhupa)
function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="group rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 p-4 ring-1 ring-gray-200 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-300/40 sm:p-6"
    >
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-transform duration-500 group-hover:scale-[1.02] sm:p-5">
        {children}
      </div>
    </div>
  )
}

const Bar = ({ className }: { className: string }) => <span className={`block h-2 rounded-full ${className}`} />

// 1. Search filters aur natije
function DiscoveryMock() {
  const { t } = useTranslation()
  return (
    <Frame>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-400">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
        {t('home.mock.searchHint')}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        {[t('home.mock.filterProfession'), t('home.mock.filterCountry'), t('home.mock.filterFollowers')].map(
          (chip, i) => (
            <span
              key={chip}
              style={{ animationDelay: `${i * 120}ms` }}
              className="inline-flex animate-fade-in-up items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-on-brand transition-transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faSliders} className="text-[9px]" />
              {chip}
            </span>
          ),
        )}
      </div>
      <ul className="mt-4 space-y-2.5">
        {['SK', 'HM', 'AR'].map((initials, i) => (
          <li
            key={initials}
            style={{ animationDelay: `${300 + i * 120}ms` }}
            className="flex animate-fade-in-up items-center gap-3 rounded-xl bg-gray-50 p-2.5 transition hover:bg-gray-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-on-brand">
              {initials}
            </span>
            <span className="flex-1 space-y-1.5">
              <Bar className={`bg-gray-300 ${['w-28', 'w-24', 'w-32'][i]}`} />
              <Bar className="w-16 bg-gray-200" />
            </span>
            <span className="text-xs font-semibold text-gray-700">{['2.3M', '1.7M', '980K'][i]}</span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

// 2. Har platform pe followers aur engagement
function ReachMock() {
  const { t } = useTranslation()
  const rows = [
    { name: 'Instagram', width: 'w-[85%]', followers: '1.2M', rate: '5.8%' },
    { name: 'TikTok', width: 'w-[70%]', followers: '900K', rate: '7.2%' },
    { name: 'YouTube', width: 'w-[45%]', followers: '650K', rate: '4.0%' },
    { name: 'X', width: 'w-[20%]', followers: '84K', rate: '2.1%' },
  ]
  return (
    <Frame>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500">{t('home.mock.totalReach')}</p>
          <p className="text-2xl font-bold">2.8M</p>
        </div>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          {t('home.mock.avgEngagement')}
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((row, i) => (
          <li key={row.name}>
            <div className="flex justify-between text-xs">
              <span className="font-medium">{row.name}</span>
              <span className="text-gray-500">
                {row.followers} · {row.rate}
              </span>
            </div>
            <span className="mt-1 block h-2 overflow-hidden rounded-full bg-gray-100">
              <span
                style={{ animationDelay: `${i * 150}ms` }}
                className={`block h-2 origin-left animate-grow-width rounded-full bg-brand ${row.width}`}
              />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-gray-400">{t('home.mock.sources')}</p>
    </Frame>
  )
}

// 3. Verified profile aur us ki janch ki list
function AuthenticityMock() {
  const { t } = useTranslation()
  return (
    <Frame>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-semibold text-on-brand">
          HM
        </span>
        <div>
          <p className="font-semibold">Hira Mani</p>
          <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-star-soft px-2 py-0.5 text-xs font-medium text-star-ink">
            <FontAwesomeIcon icon={faCircleCheck} className="animate-pulse-soft" />
            {t('site.verified')}
          </span>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {[t('home.mock.checkClaimed'), t('home.mock.checkCode'), t('home.mock.checkSources'), t('home.mock.checkReviews')].map(
          (item, i) => (
            <li
              key={item}
              style={{ animationDelay: `${i * 150}ms` }}
              className="flex animate-fade-in-up items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2 transition hover:bg-gray-100"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-green-700">
                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              </span>
              {item}
            </li>
          ),
        )}
      </ul>
    </Frame>
  )
}

// 4. Shortlist se seedhi hire request
function OutreachMock() {
  const { t } = useTranslation()
  return (
    <Frame>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <FontAwesomeIcon icon={faStar} className="animate-spin-slow text-amber-500" />
        {t('home.mock.shortlist')}
      </p>
      <div className="mt-3 flex -space-x-2 rtl:space-x-reverse">
        {['SK', 'AR', 'HM', 'OA'].map((initials, i) => (
          <span
            key={initials}
            style={{ animationDelay: `${i * 100}ms` }}
            className="flex h-9 w-9 animate-fade-in-up items-center justify-center rounded-full bg-brand text-xs font-semibold text-on-brand ring-2 ring-white transition hover:z-10 hover:scale-110"
          >
            {initials}
          </span>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-gray-200 p-3 transition hover:border-gray-400 hover:shadow-sm">
        <p className="text-sm font-semibold">{t('home.mock.requestTitle')}</p>
        <div className="mt-2 space-y-1.5">
          <Bar className="w-full bg-gray-200" />
          <Bar className="w-4/5 bg-gray-200" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{t('home.mock.budget')}</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand transition hover:scale-105">
            <FontAwesomeIcon icon={faPaperPlane} className="animate-float-up text-[10px]" />
            {t('home.mock.send')}
          </span>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <FontAwesomeIcon icon={faHandshake} className="animate-pulse-soft" />
        {t('home.mock.accepted')}
      </p>
    </Frame>
  )
}

// 5. Muahida: milestones aur dono taraf ke dastakhat
function HiringMock() {
  const { t } = useTranslation()
  const milestones = [
    { label: t('home.mock.milestone1'), done: true },
    { label: t('home.mock.milestone2'), done: true },
    { label: t('home.mock.milestone3'), done: false },
  ]
  return (
    <Frame>
      <div className="flex items-center justify-between">
        <p className="font-semibold">{t('home.mock.agreement')}</p>
        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          {t('home.mock.active')}
        </span>
      </div>
      <ol className="mt-4 space-y-2.5">
        {milestones.map((milestone, i) => (
          <li
            key={milestone.label}
            style={{ animationDelay: `${i * 150}ms` }}
            className="flex animate-fade-in-up items-center gap-2.5 text-sm"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                milestone.done ? 'bg-brand text-on-brand' : 'border-2 border-gray-300'
              }`}
            >
              {milestone.done && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
            </span>
            <span className={milestone.done ? 'text-gray-500 line-through' : ''}>{milestone.label}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 text-xs">
        {[t('home.mock.brand'), t('home.mock.talent')].map((side) => (
          <span key={side} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2">
            <FontAwesomeIcon icon={faFileSignature} className="text-green-700" />
            {t('home.mock.signedBy', { side })}
          </span>
        ))}
      </div>
    </Frame>
  )
}

const FEATURES: { key: FeatureKey; icon: IconDefinition; mock: () => ReactNode }[] = [
  { key: 'discovery', icon: faSliders, mock: () => <DiscoveryMock /> },
  { key: 'reach', icon: faChartColumn, mock: () => <ReachMock /> },
  { key: 'authenticity', icon: faShieldHalved, mock: () => <AuthenticityMock /> },
  { key: 'outreach', icon: faPaperPlane, mock: () => <OutreachMock /> },
  { key: 'hiring', icon: faFileSignature, mock: () => <HiringMock /> },
]

// Home page: platform kya karta hai, paanch hisson mein. Likhai aur tasveer baari baari daayen / baayen
function FeatureBlocks() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const links: Record<FeatureKey, string> = {
    discovery: '/search',
    reach: '/search?sort=followers',
    authenticity: '/search',
    outreach: user ? '/dashboard' : '/register',
    hiring: user ? '/dashboard' : '/register',
  }

  return (
    <section
      id="features"
      className="relative w-full scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-gray-50/60 to-white py-12 md:py-16"
    >
      {/* ✅ Background vector shapes — white theme mein visible */}

      {/* Top-left: halka blue blob — floating animation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 animate-float-slow rounded-full bg-gradient-to-br from-violet-100/70 to-fuchsia-100/50 blur-3xl"
      />

      {/* Bottom-right: halka amber blob — floating reverse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 animate-float-slow-reverse rounded-full bg-gradient-to-tl from-orange-100/60 to-fuchsia-100/40 blur-3xl"
      />

      {/* Middle-right: chhota violet glow (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/2 hidden h-72 w-72 -translate-y-1/2 animate-float-slow rounded-full bg-violet-100/50 blur-3xl lg:block"
      />

      {/* Middle-left: chhota emerald glow (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/4 hidden h-64 w-64 animate-float-slow-reverse rounded-full bg-fuchsia-100/40 blur-3xl lg:block"
      />

      {/* Dots grid — top-right, gray-400 se visible */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-8 top-16 hidden h-32 w-32 text-gray-400/70 md:block"
        fill="currentColor"
        viewBox="0 0 100 100"
      >
        {Array.from({ length: 49 }).map((_, i) => (
          <circle key={i} cx={(i % 7) * 15 + 7} cy={Math.floor(i / 7) * 15 + 7} r="2" />
        ))}
      </svg>

      {/* Dots grid — bottom-left */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 left-8 hidden h-32 w-32 text-gray-400/70 md:block"
        fill="currentColor"
        viewBox="0 0 100 100"
      >
        {Array.from({ length: 49 }).map((_, i) => (
          <circle key={i} cx={(i % 7) * 15 + 7} cy={Math.floor(i / 7) * 15 + 7} r="2" />
        ))}
      </svg>

      {/* Dashed ring — left, upper third — rotating */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-12 top-1/3 hidden h-40 w-40 animate-spin-slow rounded-full border-2 border-dashed border-blue-200 lg:block"
      />

      {/* Dashed ring — right, lower third — rotating reverse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-12 bottom-1/3 hidden h-36 w-36 animate-spin-slow-reverse rounded-full border-2 border-dashed border-violet-200 lg:block"
      />

      {/* Solid emerald circle — middle-left — pulsing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/3 top-2/3 hidden h-24 w-24 animate-pulse-soft rounded-full bg-gradient-to-br from-emerald-100/80 to-transparent lg:block"
      />

      {/* Diagonal lines — top-left corner, gray-300 se visible */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-40 w-40 text-gray-300"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={i * 14} y1="0" x2="0" y2={i * 14} />
        ))}
      </svg>

      {/* Cross/plus pattern — bottom-right corner */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 text-gray-300"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        {Array.from({ length: 4 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) => (
            <g key={`${i}-${j}`}>
              <line x1={i * 25 + 5} y1={j * 25 + 12} x2={i * 25 + 19} y2={j * 25 + 12} />
              <line x1={i * 25 + 12} y1={j * 25 + 5} x2={i * 25 + 12} y2={j * 25 + 19} />
            </g>
          )),
        )}
      </svg>

      {/* Zigzag line — top, center-right — animated draw */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-1/3 top-8 hidden h-16 w-40 text-blue-300/60 md:block"
        viewBox="0 0 200 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <polyline
          points="0,20 25,5 50,35 75,5 100,35 125,5 150,35 175,5 200,20"
          strokeDasharray="800"
          strokeDashoffset="800"
          className="animate-draw-line"
        />
      </svg>

      {/* ✅ Content — max-w-6xl ke andar, same width */}
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="animate-fade-in-up text-xl font-semibold md:text-2xl">
            {t('home.featuresTitle')}
          </h2>
          <p
            style={{ animationDelay: '150ms' }}
            className="mx-auto mt-1 max-w-xl animate-fade-in-up text-sm text-gray-500"
          >
            {t('home.featuresSubtitle')}
          </p>
        </div>

        <div className="mt-10 space-y-16 md:space-y-24">
          {FEATURES.map((feature, i) => (
            <article
              key={feature.key}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              {/* Text side — fade-in-up on view */}
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-on-brand">
                    <FontAwesomeIcon icon={feature.icon} className="text-[11px]" />
                  </span>
                  {t(`home.features.${feature.key}.eyebrow`)}
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                  {t(`home.features.${feature.key}.title`)}
                </h3>
                <p className="mt-3 text-gray-600">{t(`home.features.${feature.key}.body`)}</p>
                <ul className="mt-5 space-y-2.5">
                  {(['p1', 'p2', 'p3'] as const).map((point, idx) => (
                    <li
                      key={point}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      className="flex animate-fade-in-up items-start gap-2.5 text-sm text-gray-700"
                    >
                      <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 text-green-600" />
                      {t(`home.features.${feature.key}.${point}`)}
                    </li>
                  ))}
                </ul>
                <Link
                  to={links[feature.key]}
                  className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition hover:bg-brand-hover hover:shadow-lg"
                >
                  {t(`home.features.${feature.key}.cta`)}
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-xs transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </Link>
              </div>

              {/* Mock side — floating subtle animation */}
              <div
                className={`${i % 2 === 1 ? 'md:order-1' : ''} animate-fade-in-up`}
                style={{ animationDelay: '200ms' }}
              >
                {feature.mock()}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureBlocks