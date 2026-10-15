import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBriefcase,
  faChartLine,
  faHandshake,
  faIdBadge,
  faLanguage,
  faLayerGroup,
  faMagnifyingGlass,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { peopleQuery } from '../api/queries'
import PersonCard from '../components/PersonCard'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../hooks/useAuth'
import { useTaxonomy } from '../hooks/useTaxonomy'
import { formatCount } from '../utils/format'

// Hero ki tasveerein (sirf sajawat, is liye alt khali)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
]
const SLIDE_MS = 4000
const FEATURED_COUNT = 6
const INDUSTRY_LIMIT = 8

// User ne "kam harkat" chuni ho to slides khud na chalein
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: industries } = useTaxonomy('industries')
  const { data: professions } = useTaxonomy('professions')

  const [slide, setSlide] = useState(0)
  const [autoPlay] = useState(() => !prefersReducedMotion())

  const {
    data: featured,
    isLoading,
    isError,
  } = useQuery(
    peopleQuery(new URLSearchParams({ limit: String(FEATURED_COUNT), sort: 'followers' })),
  )

  // Har 4 second baad agli tasveer, mouse upar ho tab bhi. Sirf tab chhupa ho to ruk jao
  useEffect(() => {
    if (!autoPlay) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSlide((prev) => (prev + 1) % HERO_IMAGES.length)
      }
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [autoPlay])

  const stats: { icon: IconDefinition; value: string; label: string }[] = [
    {
      icon: faUsers,
      value: featured ? formatCount(featured.meta.total) : '–',
      label: t('home.statProfiles'),
    },
    {
      icon: faBriefcase,
      value: industries ? String(industries.length) : '–',
      label: t('home.statIndustries'),
    },
    {
      icon: faIdBadge,
      value: professions ? String(professions.length) : '–',
      label: t('home.statProfessions'),
    },
    { icon: faLanguage, value: '3', label: t('home.statLanguages') },
  ]

  const steps: { icon: IconDefinition; title: string; body: string }[] = [
    { icon: faMagnifyingGlass, title: t('home.step1Title'), body: t('home.step1Body') },
    { icon: faChartLine, title: t('home.step2Title'), body: t('home.step2Body') },
    { icon: faHandshake, title: t('home.step3Title'), body: t('home.step3Body') },
  ]

  const chip =
    'rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur transition hover:bg-white/20 hover:text-white'

  return (
    <div className="space-y-16">
      {/* Hero: tasveeron ka carousel, search aur platform ke numbers */}
      <section
        aria-label={t('home.heroLabel')}
        className="keep-dark relative isolate overflow-hidden bg-gray-950"
      >
        {/* Tasveerein peeche; dheere zoom ke saath badalti hain */}
        <div className="absolute inset-0 -z-10">
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out ${
                i === slide ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
              }`}
            />
          ))}
          {/* Likhai wali taraf (start) gehra, doosri taraf tasveer saaf dikhe */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-gray-950/10 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
        </div>

        {/* Likhai navbar ki seedh mein: andar max-w-6xl, tasveer poori chaurai */}
        <div className="relative mx-auto flex min-h-[34rem] max-w-6xl flex-col justify-between gap-10 px-4 py-12 sm:py-14 md:min-h-[38rem] md:py-20">
          <div className="max-w-2xl text-center md:text-start">

            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:mx-0 md:text-lg mx-auto">
              {t('home.subtitle')}
            </p>

            <div className="mt-7 max-w-xl md:mx-0 mx-auto">
              <SearchBar size="lg" tone="onDark" />
            </div>

            {/* Jaldi wale links: sab se zyada followers + pehli chand industries */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80 md:justify-start">
              <span className="hidden sm:inline">{t('home.popular')}</span>
              <Link to="/search?sort=followers" className={chip}>
                {t('home.mostFollowed')}
              </Link>
              {industries?.slice(0, 3).map((industry) => (
                <Link key={industry._id} to={`/search?industry=${industry.slug}`} className={chip}>
                  {industry.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Platform ke numbers: hero ke andar sheeshe jaisi patti */}
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col-reverse gap-1 p-4 md:p-5 ${
                  i % 2 === 1 ? 'border-s border-white/10' : ''
                } ${i >= 2 ? 'border-t border-white/10 md:border-t-0' : ''} ${
                  i === 2 ? 'md:border-s' : ''
                }`}
              >
                <dt className="flex items-center gap-1.5 text-xs text-white/70">
                  <FontAwesomeIcon icon={stat.icon} className="text-[11px] text-white/50" />
                  {stat.label}
                </dt>
                <dd className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4">
        {/* Industry ke hisaab se */}
        <section>
          <SectionHeader title={t('home.browseByIndustry')} to="/browse" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {industries
              ? industries.slice(0, INDUSTRY_LIMIT).map((industry) => (
                  <Link
                    key={industry._id}
                    to={`/search?industry=${industry.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-3.5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md sm:px-4 sm:py-4"
                  >
                    <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-gray-900 group-hover:text-white">
                        <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                      </span>
                      <span className="leading-snug">{industry.name}</span>
                    </span>
                    <span className="hidden sm:inline">
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-xs text-gray-400 transition group-hover:text-gray-900 rtl:rotate-180"
                      />
                    </span>
                  </Link>
                ))
              : Array.from({ length: INDUSTRY_LIMIT }, (_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200/70" />
                ))}
          </div>
        </section>

        {/* Sab se zyada followers wale log */}
        <section>
          <SectionHeader title={t('home.mostFollowed')} to="/search?sort=followers" />
          {isError && !featured && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('home.loadError')}
            </p>
          )}
          {featured && featured.people.length === 0 && (
            <p className="mt-5 text-gray-500">{t('home.noProfiles')}</p>
          )}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: FEATURED_COUNT }, (_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200/70" />
                ))
              : featured?.people.map((person) => <PersonCard key={person._id} person={person} />)}
          </div>
        </section>

        {/* Kaise kaam karta hai */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-10">
          <h2 className="text-center text-2xl font-bold">{t('home.howTitle')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
            {t('home.howSubtitle')}
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.title} className="rounded-2xl bg-gray-50 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <FontAwesomeIcon icon={step.icon} />
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Aakhri dawat: guest ke liye sign up, login wale ke liye dashboard */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="keep-dark rounded-3xl bg-gray-900 p-6 text-white md:p-8">
            <h2 className="text-xl font-semibold">{t('home.ctaTalentTitle')}</h2>
            <p className="mt-2 text-sm text-white/75">{t('home.ctaTalentBody')}</p>
            <Link
              to={user ? '/dashboard' : '/register'}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              {user ? t('home.ctaDashboard') : t('home.ctaTalentButton')}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
            </Link>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
            <h2 className="text-xl font-semibold">{t('home.ctaBusinessTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('home.ctaBusinessBody')}</p>
            <Link
              to="/search"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              {t('home.ctaBusinessButton')}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHeader({ title, to }: { title: string; to: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        {t('home.seeAll')}
        <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
      </Link>
    </div>
  )
}

export default Home
