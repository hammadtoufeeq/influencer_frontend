import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBriefcase,
  faCheck,
  faCircleCheck,
  faPlay,
  faStar,
  faUserTie,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { peopleQuery } from '../api/queries'
import SearchBar from '../components/SearchBar'
import { useAuth } from '../hooks/useAuth'
import { useTaxonomy } from '../hooks/useTaxonomy'
import type { PersonSummary } from '../types/person'
import { formatCount, initials } from '../utils/format'

// Optional hero video: put a short muted loop at public/videos/hero.mp4.
// If the file is missing the page simply shows the animated background.
const HERO_VIDEO = '/videos/hero.mp4'
const FEATURED_COUNT = 6
const STRIP_COUNT = 12
const INDUSTRY_LIMIT = 8

// Tile pictures; if one fails to load the gradient behind it still looks good
const INDUSTRY_IMAGES = [
  'photo-1522071820081-009f0129c71c',
  'photo-1600880292203-757bb62b4baf',
  'photo-1543269865-cbf427effbad',
  'photo-1521737604893-d14cc237f11d',
  'photo-1611162617213-7d7a39e9b1d7',
  'photo-1492684223066-81342ee5ff30',
  'photo-1516035069371-29a1b244cc32',
  'photo-1529156069898-49953e39b3ac',
].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=75`)

const TILE_GRADIENTS = [
  'from-brand-coral to-brand-violet',
  'from-brand-violet to-brand-plum',
  'from-brand-sun to-brand-coral',
  'from-brand-plum to-brand-coral',
]

const STAGE_POSITIONS = [
  'left-0 top-10 w-44 -rotate-6 animate-float xl:w-52',
  'left-1/2 top-0 z-10 w-52 -translate-x-1/2 animate-float-slow xl:w-60',
  'right-0 top-20 w-44 rotate-6 animate-float xl:w-52',
]

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Becomes true once the element has scrolled into view (and stays true)
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return [ref, seen] as const
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${seen ? 'is-in' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

// Counts up from 0 when it scrolls into view
function CountUp({ value }: { value: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (prefersReducedMotion()) {
      setN(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1500)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, value])
  return <span ref={ref}>{formatCount(n)}</span>
}

function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setInterval(() => setI((p) => (p + 1) % words.length), 2200)
    return () => window.clearInterval(id)
  }, [words.length])
  return (
    <span
      key={i}
      className="inline-block animate-word bg-gradient-to-r from-brand-coral to-brand-sun bg-clip-text text-transparent"
    >
      {words[i]}
    </span>
  )
}

// Profile photo; falls back to a gradient with initials
function Photo({ person, className }: { person: PersonSummary; className: string }) {
  const [failed, setFailed] = useState(false)
  if (person.photoUrl && !failed) {
    return (
      <img
        src={person.photoUrl}
        alt={person.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${className} object-cover object-[center_20%]`}
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className={`${className} flex items-center justify-center bg-gradient-to-br from-brand-coral to-brand-violet text-4xl font-bold text-white`}
    >
      {initials(person.name)}
    </div>
  )
}

function IndustryTile({
  to,
  name,
  index,
}: {
  to: string
  name: string
  index: number
}) {
  const [broken, setBroken] = useState(false)
  return (
    <Link
      to={to}
      className={`group keep-dark relative isolate flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br ${
        TILE_GRADIENTS[index % TILE_GRADIENTS.length]
      } p-4 text-white shadow-md transition duration-500 hover:-translate-y-1.5 hover:shadow-xl`}
    >
      {!broken && (
        <img
          src={INDUSTRY_IMAGES[index % INDUSTRY_IMAGES.length]}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="flex w-full items-center justify-between gap-2 font-display text-lg font-bold leading-tight">
        {name}
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-sm opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100 rtl:rotate-180"
        />
      </span>
    </Link>
  )
}

function Home() {
  const { t } = useTranslation()
  const d = (key: string, defaultValue: string) => t(key, { defaultValue })
  const { user } = useAuth()
  const { data: industries } = useTaxonomy('industries')
  const [tab, setTab] = useState<'brands' | 'talent' | 'managers'>('brands')
  const [videoOk, setVideoOk] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [reduced] = useState(prefersReducedMotion)

  const { data, isLoading, isError } = useQuery(
    peopleQuery(new URLSearchParams({ limit: String(STRIP_COUNT), sort: 'followers' })),
  )
  const people = data?.people ?? []
  const featured = people.slice(0, FEATURED_COUNT)
  const stage = people.slice(0, 3)
  const reach = featured.reduce((sum, p) => sum + p.totalFollowers, 0)

  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPlaying(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing])

  const stats = [
    { value: data?.meta.total ?? 0, label: t('home.statProfiles') },
    { value: reach, label: d('home.statReach', 'Combined reach of top creators') },
    { value: industries?.length ?? 0, label: t('home.statIndustries') },
    { value: 3, label: t('home.statLanguages') },
  ]

  const tabs = {
    brands: {
      icon: faBriefcase,
      label: d('home.tabBrands', 'For brands'),
      title: d('home.tabBrandsTitle', 'Find the right voice and hire with confidence'),
      points: [
        d('home.tabBrands1', 'Search verified creators by industry, country and followers'),
        d('home.tabBrands2', 'Save favourites to shortlists and compare them side by side'),
        d('home.tabBrands3', 'Send a hire request and sign a milestone agreement online'),
      ],
      cta: d('home.tabBrandsCta', 'Start exploring'),
      to: '/search',
    },
    talent: {
      icon: faStar,
      label: d('home.tabTalent', 'For creators'),
      title: d('home.tabTalentTitle', 'Own your profile and turn reach into work'),
      points: [
        d('home.tabTalent1', 'Claim your profile and get the verified badge'),
        d('home.tabTalent2', 'List your services, prices and availability'),
        d('home.tabTalent3', 'Answer hire requests and get paid per milestone'),
      ],
      cta: user ? t('home.ctaDashboard') : t('home.ctaTalentButton'),
      to: user ? '/dashboard' : '/register',
    },
    managers: {
      icon: faUserTie,
      label: d('home.tabManagers', 'For managers'),
      title: d('home.tabManagersTitle', 'Run a whole roster from one place'),
      points: [
        d('home.tabManagers1', 'Request to represent talent, always with their consent'),
        d('home.tabManagers2', 'Handle hire requests for every talent in one inbox'),
        d('home.tabManagers3', 'Edit profiles and services on their behalf'),
      ],
      cta: user ? t('home.ctaDashboard') : t('home.ctaTalentButton'),
      to: user ? '/dashboard' : '/register',
    },
  }
  const current = tabs[tab]
  const words = [
    d('home.wordCreators', 'creators'),
    d('home.wordJournalists', 'journalists'),
    d('home.wordSpeakers', 'speakers'),
    d('home.wordExperts', 'experts'),
  ]
  const chip =
    'rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur transition hover:bg-white/20 hover:text-white'

  return (
    <div className="pb-16">
      {/* Hero */}
      <section
        aria-label={t('home.heroLabel')}
        className="keep-dark relative isolate overflow-hidden bg-brand-plum"
      >
        <div className="absolute inset-0 -z-10">
          {!reduced && (
            <video
              src={HERO_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={() => setVideoOk(true)}
              onError={() => setVideoOk(false)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                videoOk ? 'opacity-40' : 'opacity-0'
              }`}
            />
          )}
          <div className="absolute -start-24 -top-24 h-96 w-96 animate-drift rounded-full bg-brand-coral/40 blur-3xl" />
          <div
            className="absolute -bottom-32 end-0 h-[30rem] w-[30rem] animate-drift rounded-full bg-brand-violet/50 blur-3xl"
            style={{ animationDelay: '-6s' }}
          />
          <div
            className="absolute start-1/3 top-1/2 h-64 w-64 animate-drift rounded-full bg-brand-sun/20 blur-3xl"
            style={{ animationDelay: '-11s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/80 via-transparent to-transparent" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-28 pt-12 md:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-start">
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              {t('home.title')}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg lg:mx-0">
              {t('home.subtitle')}
            </p>
            <p className="mt-5 font-display text-2xl font-bold text-white md:text-3xl">
              {d('home.findTop', 'Find top')} <RotatingWord words={words} />
            </p>

            <div className="mx-auto mt-6 max-w-xl lg:mx-0">
              <SearchBar size="lg" tone="onDark" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80 lg:justify-start">
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

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                to="/search"
                className="keep-dark animate-sheen rounded-xl bg-gradient-to-r from-brand-coral via-brand-violet to-brand-coral bg-[length:200%_100%] px-6 py-3 font-semibold text-white shadow-lg shadow-brand-coral/30 transition hover:scale-105"
              >
                {d('home.findInfluencers', 'Find influencers')}
              </Link>
              <Link
                to={user ? '/dashboard' : '/register'}
                className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                {user ? t('home.ctaDashboard') : d('home.joinAsTalent', 'Join as talent')}
              </Link>
              {videoOk && (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="inline-flex items-center gap-3 text-sm font-medium text-white/90 hover:text-white"
                >
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-plum">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                    <FontAwesomeIcon icon={faPlay} className="relative text-xs" />
                  </span>
                  {d('home.watchVideo', 'Watch how it works')}
                </button>
              )}
            </div>
          </div>

          {/* Floating influencer cards */}
          <div className="relative mx-auto hidden h-[27rem] w-full max-w-md lg:block">
            {stage.map((p, i) => (
              <Link
                key={p._id}
                to={`/people/${p.slug}`}
                style={{ animationDelay: `${i * -2.5}s` }}
                className={`absolute ${STAGE_POSITIONS[i]} overflow-hidden rounded-3xl bg-brand-plum shadow-2xl shadow-black/40 ring-1 ring-white/25`}
              >
                <Photo person={p} className="aspect-[3/4] w-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-12 text-white">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                    {p.name}
                    {p.verified && (
                      <FontAwesomeIcon icon={faCircleCheck} className="text-xs text-sky-300" />
                    )}
                  </p>
                  <p className="text-xs text-white/80">
                    {t('site.followers', { value: formatCount(p.totalFollowers) })}
                  </p>
                </div>
              </Link>
            ))}
            {reach > 0 && (
              <div className="absolute -bottom-2 start-2 z-20 animate-float-slow rounded-2xl bg-white px-4 py-2.5 text-gray-900 shadow-xl">
                <p className="font-display text-2xl font-extrabold leading-none">
                  {formatCount(reach)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {d('home.combinedReach', 'combined reach')}
                </p>
              </div>
            )}
            <div className="absolute end-2 top-0 z-20 flex animate-float items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 shadow-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              {d('home.openToWork', 'Open to work')}
            </div>
          </div>
        </div>
      </section>

      {/* Stats card overlapping the hero */}
      <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-gray-200 shadow-xl ring-1 ring-gray-200 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 bg-white p-5 md:p-6">
                <dt className="text-xs text-gray-500 md:text-sm">{s.label}</dt>
                <dd className="bg-gradient-to-r from-brand-coral to-brand-violet bg-clip-text font-display text-3xl font-extrabold text-transparent md:text-4xl">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* Scrolling strip of top creators */}
      {people.length > 0 && (
        <section className="group mt-14 overflow-hidden" aria-label={t('home.mostFollowed')}>
          <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
            {[...people, ...people].map((p, i) => (
              <Link
                key={`${p._id}-${i}`}
                to={`/people/${p.slug}`}
                aria-hidden={i >= people.length}
                tabIndex={i >= people.length ? -1 : 0}
                className="flex shrink-0 items-center gap-3 rounded-full bg-white py-2 pe-5 ps-2 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Photo person={p} className="h-11 w-11 rounded-full" />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="block text-xs text-gray-500">
                    {t('site.followers', { value: formatCount(p.totalFollowers) })}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto mt-20 max-w-6xl space-y-24 px-4">
        {/* Industries */}
        <section>
          <Reveal>
            <SectionHeader title={t('home.browseByIndustry')} to="/browse" />
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {industries
              ? industries.slice(0, INDUSTRY_LIMIT).map((industry, i) => (
                  <Reveal key={industry._id} delay={(i % 4) * 80}>
                    <IndustryTile
                      to={`/search?industry=${industry.slug}`}
                      name={industry.name}
                      index={i}
                    />
                  </Reveal>
                ))
              : Array.from({ length: INDUSTRY_LIMIT }, (_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200/70" />
                ))}
          </div>
        </section>

        {/* Featured people */}
        <section>
          <Reveal>
            <SectionHeader title={t('home.mostFollowed')} to="/search?sort=followers" />
          </Reveal>
          {isError && !data && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('home.loadError')}
            </p>
          )}
          {data && featured.length === 0 && (
            <p className="mt-5 text-gray-500">{t('home.noProfiles')}</p>
          )}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: FEATURED_COUNT }, (_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl bg-gray-200/70" />
                ))
              : featured.map((p, i) => (
                  <Reveal key={p._id} delay={(i % 3) * 100}>
                    <Link
                      to={`/people/${p.slug}`}
                      className="group keep-dark relative block aspect-[3/4] overflow-hidden rounded-3xl bg-brand-plum text-white shadow-lg transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    >
                      <Photo
                        person={p}
                        className="h-full w-full transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <span className="absolute end-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900 shadow">
                        {t('site.followers', { value: formatCount(p.totalFollowers) })}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="flex items-center gap-2 font-display text-xl font-bold">
                          <span className="truncate">{p.name}</span>
                          {p.verified && (
                            <FontAwesomeIcon icon={faCircleCheck} className="text-sm text-sky-300" />
                          )}
                        </p>
                        {p.headline && (
                          <p className="mt-1 line-clamp-1 text-sm text-white/80">{p.headline}</p>
                        )}
                        <span className="mt-3 inline-flex translate-y-3 items-center gap-2 text-sm font-semibold opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          {d('home.viewProfile', 'View profile')}
                          <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
          </div>
        </section>

        {/* Tabs per role */}
        <Reveal>
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-10">
            <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
              {d('home.rolesTitle', 'One platform, three ways to work')}
            </h2>
            <div
              role="tablist"
              className="mx-auto mt-6 flex w-fit max-w-full flex-wrap justify-center gap-2 rounded-full bg-gray-100 p-1.5"
            >
              {(Object.keys(tabs) as (keyof typeof tabs)[]).map((id) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                    tab === id
                      ? 'keep-dark bg-gradient-to-r from-brand-coral to-brand-violet text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={tabs[id].icon} className="text-xs" />
                  {tabs[id].label}
                </button>
              ))}
            </div>

            <div key={tab} className="mt-8 grid items-center gap-8 md:grid-cols-2">
              <ul className="space-y-4">
                {current.points.map((point, i) => (
                  <li
                    key={point}
                    className="flex animate-slide-in gap-3"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-coral/15 text-brand-coral">
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    </span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="keep-dark relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-violet to-brand-coral p-8 text-white">
                <div className="absolute -end-10 -top-10 -z-10 h-48 w-48 animate-drift rounded-full bg-white/20 blur-2xl" />
                <FontAwesomeIcon icon={current.icon} className="text-4xl text-white/90" />
                <h3 className="mt-4 font-display text-2xl font-bold leading-snug">
                  {current.title}
                </h3>
                <Link
                  to={current.to}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:scale-105"
                >
                  {current.cta}
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Final call to action */}
        <Reveal>
          <section className="keep-dark relative isolate overflow-hidden rounded-[2rem] bg-brand-plum p-6 text-white md:p-12">
            <div className="absolute -start-20 -top-20 -z-10 h-80 w-80 animate-drift rounded-full bg-brand-coral/40 blur-3xl" />
            <div
              className="absolute -bottom-24 end-0 -z-10 h-80 w-80 animate-drift rounded-full bg-brand-violet/50 blur-3xl"
              style={{ animationDelay: '-8s' }}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur">
                <h2 className="font-display text-2xl font-bold">{t('home.ctaTalentTitle')}</h2>
                <p className="mt-2 text-sm text-white/80">{t('home.ctaTalentBody')}</p>
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:scale-105"
                >
                  {user ? t('home.ctaDashboard') : t('home.ctaTalentButton')}
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
                </Link>
              </div>
              <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur">
                <h2 className="font-display text-2xl font-bold">{t('home.ctaBusinessTitle')}</h2>
                <p className="mt-2 text-sm text-white/80">{t('home.ctaBusinessBody')}</p>
                <Link
                  to="/search"
                  className="animate-sheen mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-coral via-brand-violet to-brand-coral bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105"
                >
                  {t('home.ctaBusinessButton')}
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </div>

      {/* Video popup */}
      {playing && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPlaying(false)}
          className="keep-dark fixed inset-0 z-[100] flex animate-fade items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            aria-label={t('common.close', { defaultValue: 'Close' })}
            onClick={() => setPlaying(false)}
            className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <video
            src={HERO_VIDEO}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-4xl rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, to }: { title: string; to: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-coral"
      >
        {t('home.seeAll')}
        <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
      </Link>
    </div>
  )
}

export default Home
