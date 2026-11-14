import { useEffect, useState } from 'react'
import { taxName } from '../utils/taxonomy'
import Sentence from '../components/admin-panel/Sentence'
import ScrollProgressButton from '../components/home/ScrollProgressButton'
import { MARK } from '../components/admin-panel/sentenceSlots'
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
import {
  Benefits,
  CountUp,
  Faq,
  FeatureShowcase,
  HighlightedText1,
  HowItWorks,
  OpenCampaigns,
  Photo,
  PlatformStrip,
  Reveal,
  prefersReducedMotion,
} from '../components/home/HomeSections'
import type { PersonSummary } from '../types/person'
import { formatCount } from '../utils/format'

// Optional hero video: put a short muted loop at public/videos/hero.mp4.
const HERO_VIDEO = '/videos/hero.mp4'
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=75'

const FEATURED_COUNT = 8
const STRIP_COUNT = 12
const INDUSTRY_LIMIT = 8

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
  'from-gray-600 to-gray-900',
  'from-gray-800 to-black',
  'from-gray-500 to-gray-800',
  'from-gray-900 to-gray-600',
]

const ROLE_IMAGES = {
  brands: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=75',
  talent: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=75',
  managers: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=75',
}

const CTA_BACKGROUND =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=75'

// Hero slides — all images are normalized to the same square canvas (1200x1200)
// Save in public/images/ as hero-1.png ... hero-5.png
const HERO_SLIDES = [
  { src: '/images/hero-3.png', alt: 'Creators on the platform' },
  { src: '/images/hero-4.png', alt: 'Brand tracking campaign reach' },
  { src: '/images/hero-1.png', alt: 'Lifestyle creator with phone' },
  { src: '/images/hero-5.png', alt: 'Content creator with laptop' },
  { src: '/images/hero-2.png', alt: 'Creator working on laptop' },
]

// Hero bottom is cut with a wavy mask, so the real page background (light or dark) shows through
const CURVE_MASK =
  'linear-gradient(#000 0 0) top / 100% calc(100% - var(--curve-h)) no-repeat, ' +
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 200\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0 L1440,0 L1440,100 C1200,40 960,180 720,100 C480,20 240,180 0,100 Z\'/%3E%3C/svg%3E") bottom / 100% var(--curve-h) no-repeat'

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
      className="inline-block animate-word bg-gradient-to-tr from-[#FFC400] via-[#FF7A00] to-[#FF2D00] bg-clip-text text-transparent"
    >
      {words[i]}
    </span>
  )
}

// Hero image slider: fixed square box so every picture has the same size, responsive on all screens
function HeroShowcase({ verifiedLabel, topLabel }: { verifiedLabel: string; topLabel: string }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || prefersReducedMotion()) return
    const id = window.setInterval(() => setActive((p) => (p + 1) % HERO_SLIDES.length), 3500)
    return () => window.clearInterval(id)
  }, [paused])

  return (
    <div
      className="relative mx-auto mb-6 aspect-square w-full max-w-[17rem] sm:max-w-sm md:max-w-md lg:mb-0 lg:ms-auto lg:max-w-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          loading={i === 0 ? 'eager' : 'lazy'}
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className={`absolute inset-0 h-full w-full object-contain transition-all duration-1000 ease-out ${
            i === active ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        />
      ))}

      {/* Floating chips */}
      <div className="absolute start-0 top-[12%] z-20 flex animate-float items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-900 shadow-xl ring-1 ring-gray-200 sm:gap-2 sm:rounded-2xl sm:px-3.5 sm:py-2 sm:text-xs">
        <FontAwesomeIcon icon={faCircleCheck} className="text-brand-violet" />
        {verifiedLabel}
      </div>
      <div
        className="absolute bottom-[14%] end-0 z-20 flex animate-float-slow items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-900 shadow-xl ring-1 ring-gray-200 sm:gap-2 sm:rounded-2xl sm:px-3.5 sm:py-2 sm:text-xs"
        style={{ animationDelay: '-2s' }}
      >
        <FontAwesomeIcon icon={faStar} className="text-[#FF7A00]" />
        {topLabel}
      </div>

      {/* Dots */}
      <div className="absolute inset-x-0 -bottom-5 z-20 flex justify-center gap-2">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? 'w-7 bg-brand-violet' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Decorative vector shapes for the roles section background
function RoleShapes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Concentric rings, top-left */}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className="absolute -start-20 -top-20 h-56 w-56 text-brand-violet/40 sm:-start-24 sm:-top-24 sm:h-80 sm:w-80"
      >
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="64" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="34" fill="currentColor" />
      </svg>

      {/* Dotted grid, top-right */}
      <svg
        viewBox="0 0 120 120"
        className="absolute end-4 top-6 hidden h-24 w-24 text-white/25 sm:block md:h-32 md:w-32"
      >
        <defs>
          <pattern id="role-dots" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="120" height="120" fill="url(#role-dots)" />
      </svg>

      {/* Triangle outline */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className="absolute start-[6%] bottom-10 h-12 w-12 rotate-12 text-white/25 sm:h-16 sm:w-16"
      >
        <path d="M50 8 L94 88 L6 88 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>

      {/* Plus signs */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="absolute end-[10%] top-[45%] h-6 w-6 text-brand-violet/60 sm:h-8 sm:w-8"
      >
        <path d="M20 4 V36 M4 20 H36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="absolute start-[42%] top-4 hidden h-5 w-5 text-white/30 md:block"
      >
        <path d="M20 4 V36 M4 20 H36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>

      {/* Soft blob, bottom-right */}
      <svg
        viewBox="0 0 200 200"
        className="absolute -bottom-16 -end-16 h-56 w-56 text-brand-violet/25 sm:-bottom-24 sm:-end-24 sm:h-80 sm:w-80"
      >
        <path
          fill="currentColor"
          d="M44.7,-58.4C57.4,-48.6,66.3,-33.6,70.6,-17.3C74.9,-1,74.6,16.7,67.1,30.6C59.6,44.5,44.9,54.6,29.1,61.1C13.3,67.6,-3.6,70.5,-19.6,66.5C-35.6,62.5,-50.7,51.6,-60.5,37.2C-70.3,22.8,-74.8,4.9,-71.3,-10.9C-67.8,-26.7,-56.3,-40.4,-42.9,-50C-29.5,-59.6,-14.7,-65.1,0.8,-66.1C16.3,-67.1,32,-68.2,44.7,-58.4Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Wave line */}
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-x-0 bottom-6 h-10 w-full text-white/15 sm:h-14"
      >
        <path
          d="M0 40 C100 0 200 80 300 40 C400 0 500 80 600 40 C700 0 800 80 900 40 C1000 0 1100 80 1200 40"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
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

// Reusable CTA card
function CtaCard({
  title,
  body,
  cta,
  to,
  variant = 'solid',
}: {
  title: string
  body: string
  cta: string
  to: string
  variant?: 'solid' | 'outline'
}) {
  return (
    <div className="w-full rounded-xl bg-white/10 p-4 text-center ring-1 ring-white/20 backdrop-blur sm:rounded-2xl sm:p-5 md:p-6 md:text-start">
      <h2 className="font-display text-base font-bold leading-snug sm:text-lg md:text-2xl">
        {title}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">{body}</p>
      <Link
        to={to}
        className={
          variant === 'solid'
            ? 'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-on-brand transition hover:scale-105 sm:mt-5 sm:px-5 sm:py-2.5 sm:text-sm md:w-auto md:justify-start'
            : 'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-4 py-2 text-xs font-semibold text-white transition hover:scale-105 hover:bg-white/10 sm:mt-5 sm:px-5 sm:py-2.5 sm:text-sm md:w-auto md:justify-start'
        }
      >
        {cta}
        <FontAwesomeIcon icon={faArrowRight} className="text-[10px] sm:text-xs rtl:rotate-180" />
      </Link>
    </div>
  )
}

function Home() {
  const { t } = useTranslation()
  const d = (key: string, defaultValue: string) => t(key, { defaultValue })
  const sub = (p: PersonSummary) =>
    p.totalFollowers > 0
      ? t('site.followers', { value: formatCount(p.totalFollowers) })
      : (p.professions[0] ? taxName(p.professions[0]) : '')
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

  const ctaTalent = {
    title: t('home.ctaTalentTitle'),
    body: t('home.ctaTalentBody'),
    cta: user ? t('home.ctaDashboard') : t('home.ctaTalentButton'),
    to: user ? '/dashboard' : '/register',
    variant: 'solid' as const,
  }
  const ctaBusiness = {
    title: t('home.ctaBusinessTitle'),
    body: t('home.ctaBusinessBody'),
    cta: t('home.ctaBusinessButton'),
    to: '/search',
    variant: 'outline' as const,
  }

  return (
    <div className="home-page overflow-x-hidden pb-16">
      <ScrollProgressButton />
      {/* Hero */}
      <div className="relative [--curve-h:6rem] sm:[--curve-h:9rem] md:[--curve-h:12rem] lg:[--curve-h:14rem]">
      <section
        aria-label={t('home.heroLabel')}
        className="keep-dark relative isolate overflow-hidden bg-brand-plum"
        style={{ mask: CURVE_MASK, WebkitMask: CURVE_MASK }}
      >
        <div className="absolute inset-0 -z-10">
          <img
            src={HERO_IMAGE}
            alt=""
            onError={(e) => (e.currentTarget.style.display = 'none')}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />

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
              className={`absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-1000 sm:block ${
                videoOk ? 'opacity-20' : 'opacity-0'
              }`}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/95 via-brand-plum/50 to-transparent" />
        </div>

        {/* 2 tilted vertical lines (decorative) */}
        <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
          <div className="absolute right-[32%] top-0 h-full w-px bg-brand-violet/60 rotate-12 transform origin-top"></div>
          <div className="absolute right-[28%] top-0 h-full w-px bg-white/40 rotate-12 transform origin-top"></div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 pb-28 pt-20 sm:gap-10 sm:pb-40 sm:pt-24 md:pt-28 lg:grid-cols-2">
          <div className="text-center lg:text-start">
            <h1 className="font-display text-2xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="text-white">
                <HighlightedText1 i18nKey="home.titleRich" />
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base md:text-lg lg:mx-0">
              {t('home.subtitle')}
            </p>
            <p className="mt-4 font-display text-lg font-bold text-white sm:mt-5 sm:text-xl md:text-2xl lg:text-3xl">
              <Sentence
                template={t('home.findTopTemplate', { word: `${MARK}word${MARK}` })}
                parts={{ word: <RotatingWord words={words} /> }}
              />
            </p>

            <div className="mx-auto mt-5 max-w-xl sm:mt-6 lg:mx-0">
              <SearchBar size="lg" tone="onDark" />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/80 sm:mt-4 sm:text-xs lg:justify-start">
              <span className="hidden sm:inline">{t('home.popular')}</span>
              <Link to="/search?sort=followers" className={chip}>
                {t('home.mostFollowed')}
              </Link>
              {industries?.slice(0, 3).map((industry) => (
                <Link key={industry._id} to={`/search?industry=${industry.slug}`} className={chip}>
                  {taxName(industry)}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
              <Link
                to="/search"
                className="keep-dark inline-flex justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-on-brand shadow-lg shadow-brand/30 transition hover:scale-105 hover:bg-brand-hover sm:px-6 sm:py-3"
              >
                {d('home.findInfluencers', 'Find influencers')}
              </Link>
              <Link
                to={user ? '/dashboard' : '/register'}
                className="inline-flex justify-center rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:px-6 sm:py-3"
              >
                {user ? t('home.ctaDashboard') : d('home.joinAsTalent', 'Join as talent')}
              </Link>
              {videoOk && (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="inline-flex items-center justify-center gap-3 text-sm font-medium text-white/90 hover:text-white"
                >
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 sm:h-11 sm:w-11">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                    <FontAwesomeIcon icon={faPlay} className="relative text-xs" />
                  </span>
                  {d('home.watchVideo', 'Watch how it works')}
                </button>
              )}
            </div>
          </div>

          {/* Image showcase: below text on mobile/tablet, right side on desktop */}
          <HeroShowcase
            verifiedLabel={d('home.heroVerified', 'Verified creators')}
            topLabel={d('home.heroTop', 'Top rated talent')}
          />
        </div>

      </section>

      {/* Purple curve line (drawn outside the masked hero so it is not clipped) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="h-[var(--curve-h)] w-full"
          aria-hidden="true"
        >
          <path
            d="M0,100 C240,180 480,20 720,100 C960,180 1200,40 1440,100"
            fill="none"
            stroke="#8b3df5"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      </div>

      {/* Stats card overlapping the hero */}
      <div className="relative z-20 mx-auto -mt-10 max-w-6xl px-4 sm:-mt-14">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-gray-200 shadow-xl ring-1 ring-gray-200 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 bg-white p-4 md:p-5 lg:p-6">
                <dt className="text-[11px] text-gray-500 sm:text-xs md:text-sm">{s.label}</dt>
                <dd className="font-display text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">
                  <CountUp value={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* Scrolling strip of top creators */}
      {people.length > 0 && (
        <section className="group mt-10 overflow-hidden sm:mt-14" aria-label={t('home.mostFollowed')}>
          <div className="flex w-max animate-marquee gap-3 sm:gap-4">
            {[...people, ...people].map((p, i) => (
              <Link
                key={`${p._id}-${i}`}
                to={`/people/${p.slug}`}
                aria-hidden={i >= people.length}
                tabIndex={i >= people.length ? -1 : 0}
                className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pe-4 ps-1.5 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md sm:gap-3 sm:py-2 sm:pe-5 sm:ps-2"
              >
                <Photo person={p} className="h-9 w-9 rounded-full sm:h-11 sm:w-11" />
                <span className="leading-tight">
                  <span className="block text-xs font-semibold sm:text-sm">{p.name}</span>
                  <span className="block text-[10px] text-gray-500 sm:text-xs">{sub(p)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto mt-12 max-w-6xl space-y-16 px-4 sm:mt-20 sm:space-y-24">
        <PlatformStrip />

        <section>
          <Reveal>
            <SectionHeader title={t('home.browseByIndustry')} />
          </Reveal>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {industries
              ? industries.slice(0, INDUSTRY_LIMIT).map((industry, i) => (
                  <Reveal key={industry._id} delay={(i % 4) * 80}>
                    <IndustryTile
                      to={`/search?industry=${industry.slug}`}
                      name={taxName(industry)}
                      index={i}
                    />
                  </Reveal>
                ))
              : Array.from({ length: INDUSTRY_LIMIT }, (_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200/70" />
                ))}
          </div>
        </section>

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
          <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: FEATURED_COUNT }, (_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-gray-200/70" />
                ))
              : featured.map((p, i) => (
                  <Reveal key={p._id} delay={(i % 4) * 90}>
                    <Link
                      to={`/people/${p.slug}`}
                      className="group keep-dark relative block aspect-[4/5] overflow-hidden rounded-3xl bg-brand-plum text-white shadow-lg transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    >
                      <Photo
                        person={p}
                        className="h-full w-full transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      {p.totalFollowers > 0 && (
                        <span className="absolute end-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-gray-900 shadow sm:end-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
                          {sub(p)}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                        <p className="flex items-center gap-1.5 font-display text-sm font-bold sm:gap-2 sm:text-lg">
                          <span className="truncate">{p.name}</span>
                          {p.verified && (
                            <FontAwesomeIcon icon={faCircleCheck} className="text-xs text-brand-sun sm:text-sm" />
                          )}
                        </p>
                        {p.headline && (
                          <p className="mt-1 line-clamp-1 text-[11px] text-white/80 sm:text-sm">{p.headline}</p>
                        )}
                        <span className="mt-2 inline-flex translate-y-3 items-center gap-2 text-xs font-semibold opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:mt-3 sm:text-sm">
                          {d('home.viewProfile', 'View profile')}
                          <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180 sm:text-xs" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
          </div>
        </section>

        <FeatureShowcase people={people} />

        <HowItWorks />
      </div>

      {/* Tabs per role — FULL WIDTH background with vector shapes, centered content */}
      <section className="relative isolate mt-16 w-full overflow-hidden bg-gray-800 py-8 shadow-sm ring-1 ring-gray-100 sm:mt-24 sm:py-10 md:py-16">
        <RoleShapes />
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 className="text-center font-display text-xl font-bold text-white sm:text-2xl md:text-3xl">
              {d('home.rolesTitle', 'One platform, three ways to work')}
            </h2>
            <div
              role="tablist"
              className="mx-auto mt-4 flex w-fit max-w-full flex-wrap justify-center gap-1.5 rounded-full bg-gray-700 p-1 sm:mt-6 sm:gap-2 sm:p-1.5"
            >
              {(Object.keys(tabs) as (keyof typeof tabs)[]).map((id) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition sm:gap-2 sm:px-5 sm:py-2 sm:text-sm ${
                    tab === id
                      ? 'bg-brand text-on-brand shadow'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={tabs[id].icon} className="text-[10px] sm:text-xs" />
                  {tabs[id].label}
                </button>
              ))}
            </div>

            <div key={tab} className="mt-6 grid items-center gap-6 sm:mt-8 sm:gap-8 md:grid-cols-2">
              <ul className="space-y-3 sm:space-y-4">
                {current.points.map((point, i) => (
                  <li
                    key={point}
                    className="flex animate-slide-in gap-2.5 sm:gap-3"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand sm:h-6 sm:w-6">
                      <FontAwesomeIcon icon={faCheck} className="text-[10px] sm:text-xs" />
                    </span>
                    <span className="text-sm text-gray-100 sm:text-base">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="keep-dark relative isolate overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-8">
                <img
                  src={ROLE_IMAGES[tab]}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 -z-20 h-full w-full object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black/85 via-black/70 to-black/50" />

                <FontAwesomeIcon icon={current.icon} className="text-3xl text-white/90 sm:text-4xl" />
                <h3 className="mt-3 font-display text-lg font-bold leading-snug sm:mt-4 sm:text-xl md:text-2xl">
                  {current.title}
                </h3>
                <Link
                  to={current.to}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-on-brand transition hover:scale-105 sm:mt-6 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  {current.cta}
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180 sm:text-xs" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OpenCampaigns — full width */}
      <div className="mt-16 sm:mt-24">
        <OpenCampaigns />
      </div>

      <div className="mx-auto max-w-6xl space-y-16 px-4 sm:space-y-24">
        <Benefits />

        <Faq />

        {/* Final CTA */}
        <Reveal>
          <section className="keep-dark relative isolate overflow-hidden rounded-2xl p-4 text-white sm:rounded-[2rem] sm:p-6 md:p-12">
            <img
              src={CTA_BACKGROUND}
              alt=""
              loading="lazy"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-plum/95 via-brand-plum/85 to-black/70" />
            <div className="absolute -start-20 -top-20 -z-10 h-80 w-80 animate-drift rounded-full bg-brand-violet/35 blur-3xl" />
            <div
              className="absolute -bottom-24 end-0 -z-10 h-80 w-80 animate-drift rounded-full bg-brand-magenta/25 blur-3xl"
              style={{ animationDelay: '-8s' }}
            />

            <div className="relative flex flex-col gap-3 sm:gap-4 md:grid md:grid-cols-2 md:gap-4">
              <CtaCard {...ctaTalent} />
              <CtaCard {...ctaBusiness} />
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

// "See all" only when there is a page to go to
function SectionHeader({ title, to }: { title: string; to?: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-xl font-bold sm:text-2xl md:text-3xl">{title}</h2>
      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 sm:text-sm"
        >
          {t('home.seeAll')}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
        </Link>
      )}
    </div>
  )
}

export default Home