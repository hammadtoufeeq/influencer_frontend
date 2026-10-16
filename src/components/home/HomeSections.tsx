import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTiktok,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import {
  faArrowRight,
  faChartLine,
  faCheck,
  faCircleCheck,
  faFileSignature,
  faHandshake,
  faLanguage,
  faMagnifyingGlass,
  faPlus,
  faShieldHalved,
  faUsers,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { campaignsQuery } from '../../api/queries'
import type { PersonSummary } from '../../types/person'
import { formatCount, initials } from '../../utils/format'
import { money } from '../../utils/price'

/* ---------- shared motion helpers ---------- */

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// True once the element has scrolled into view (and stays true)
export function useInView<T extends HTMLElement>() {
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

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
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

export function CountUp({ value }: { value: number }) {
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

// Profile photo; falls back to a gradient with initials
export function Photo({ person, className }: { person: PersonSummary; className: string }) {
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
      className={`${className} keep-dark flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900 text-lg font-bold text-white`}
    >
      {initials(person.name)}
    </div>
  )
}

function useD() {
  const { t } = useTranslation()
  return (key: string, defaultValue: string) => t(key, { defaultValue })
}

function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <h2 className="font-display text-xl font-bold leading-tight sm:text-2xl md:text-4xl">
        {children}
      </h2>
      {sub && <p className="mt-3 text-sm text-gray-600 sm:text-base">{sub}</p>}
    </Reveal>
  )
}

/* ---------- 1. Platforms strip ---------- */

const PLATFORMS = [
  { icon: faInstagram, name: 'Instagram', color: 'text-[#E4405F]' },
  { icon: faYoutube, name: 'YouTube', color: 'text-[#FF0000]' },
  { icon: faTiktok, name: 'TikTok', color: 'text-black dark:text-[#ffffff]' },
  { icon: faXTwitter, name: 'X', color: 'text-black dark:text-[#ffffff]' },
  { icon: faFacebook, name: 'Facebook', color: 'text-[#1877F2]' },
  { icon: faLinkedin, name: 'LinkedIn', color: 'text-[#0A66C2]' },
]

export function PlatformStrip() {
  const d = useD()
  return (
    <section className="text-center">
      <Reveal>
        <p className="font-display text-base font-semibold text-gray-600 sm:text-lg">
          {d('home.platformsTitle', 'See reach across every platform they use')}
        </p>
      </Reveal>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5 md:gap-10">
        {PLATFORMS.map((p, i) => (
          <Reveal key={p.name} delay={i * 80}>
            <span
              title={p.name}
              style={{ animationDelay: `${i * -1.2}s` }}
              className={`flex h-12 w-12 animate-float items-center justify-center rounded-xl bg-white text-2xl shadow-md ring-1 ring-gray-100 transition hover:scale-110 sm:h-14 sm:w-14 sm:text-3xl md:h-16 md:w-16 ${p.color}`}
            >
              <FontAwesomeIcon icon={p.icon} />
              <span className="sr-only">{p.name}</span>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- 2. Feature showcase with small example mock-ups ---------- */

function Showcase({
  title,
  body,
  points,
  flip,
  children,
}: {
  title: string
  body: string
  points: string[]
  flip?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={`grid min-w-0 grid-cols-1 items-center gap-6 sm:gap-8 md:grid-cols-2 md:gap-14 ${
        flip ? 'md:[&>*:first-child]:order-2' : ''
      }`}
    >
      <Reveal className="min-w-0">
        <h3 className="font-display text-xl font-bold sm:text-2xl md:text-3xl">{title}</h3>
        <p className="mt-3 text-sm text-gray-600 sm:text-base">{body}</p>
        <ul className="mt-5 space-y-2.5">
          {points.map((p) => (
            <li key={p} className="flex min-w-0 items-start gap-2.5 text-sm text-gray-700">
              <FontAwesomeIcon icon={faCheck} className="mt-0.5 shrink-0 text-xs text-gray-900" />
              <span className="min-w-0">{p}</span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={150} className="min-w-0 w-full">
        <div className="relative w-full min-w-0 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 p-3 ring-1 ring-gray-100 sm:rounded-3xl sm:p-5">
          <span className="absolute end-3 top-2 text-[10px] text-gray-400 sm:end-4 sm:top-3 sm:text-[11px]">
            Example
          </span>
          <div className="space-y-2.5 pt-4 sm:space-y-3">{children}</div>
        </div>
      </Reveal>
    </div>
  )
}

function MockRow({
  person,
  title,
  note,
  tag,
  delay,
}: {
  person?: PersonSummary
  title: string
  note: string
  tag?: ReactNode
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-gray-100 sm:gap-3 sm:p-3">
        {person ? (
          <Photo person={person} className="h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10" />
        ) : (
          <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-gray-500 to-gray-800 sm:h-10 sm:w-10" />
        )}
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-semibold sm:text-sm">
            {person?.name ?? title}
          </span>
          <span className="block truncate text-[11px] text-gray-500 sm:text-xs">{note}</span>
        </span>
        <span className="shrink-0">{tag}</span>
      </div>
    </Reveal>
  )
}

const pill = 'rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap sm:px-2.5 sm:py-1 sm:text-[11px]'

function Progress({ percent }: { percent: number }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="h-2 overflow-hidden rounded-full bg-gray-100 sm:h-2.5">
      <div
        style={{ width: seen ? `${percent}%` : '0%' }}
        className="h-full rounded-full bg-gray-900 transition-[width] duration-[1600ms] ease-out"
      />
    </div>
  )
}

export function FeatureShowcase({ people }: { people: PersonSummary[] }) {
  const d = useD()
  const [a, b, c] = people
  return (
    <section className="space-y-14 sm:space-y-20 md:space-y-28">
      <Title sub={d('home.toolkitSub', 'Search, shortlist, hire and get it in writing, all in one place.')}>
        {d('home.toolkitTitle', 'Everything you need to work with creators')}
      </Title>

      <Showcase
        title={d('home.fDiscoverTitle', 'Discover the right people in seconds')}
        body={d('home.fDiscoverBody', 'Filter by profession, industry, country, language and reach. Every verified profile shows its sources openly.')}
        points={[
          d('home.fDiscover1', 'Search by name, topic or city'),
          d('home.fDiscover2', 'Filters that live in the link, so you can share a search'),
          d('home.fDiscover3', 'Verified badge on claimed profiles'),
        ]}
      >
        <MockRow
          person={a}
          title="Creator"
          note={a?.headline ?? 'Technology · Pakistan'}
          delay={0}
          tag={<span className={`${pill} bg-green-100 text-green-700`}>{d('home.openToWork', 'Open to work')}</span>}
        />
        <MockRow
          person={b}
          title="Creator"
          note={b?.headline ?? 'Media & News · Pakistan'}
          delay={120}
          tag={<FontAwesomeIcon icon={faCircleCheck} className="text-sky-500" />}
        />
        <MockRow
          person={c}
          title="Creator"
          note={c?.headline ?? 'Entertainment · Pakistan'}
          delay={240}
          tag={<FontAwesomeIcon icon={faCircleCheck} className="text-sky-500" />}
        />
      </Showcase>

      <Showcase
        flip
        title={d('home.fShortlistTitle', 'Shortlist, compare and decide')}
        body={d('home.fShortlistBody', 'Keep a named list for every campaign, add private notes, and compare up to four people side by side.')}
        points={[
          d('home.fShortlist1', 'Private notes on every person'),
          d('home.fShortlist2', 'Ratings from completed work'),
          d('home.fShortlist3', 'Hire straight from the list'),
        ]}
      >
        <MockRow title="Summer launch" note="3 people saved" delay={0} tag={<span className={`${pill} animate-pulse bg-gray-900 text-white`}>Compare</span>} />
        <MockRow person={b} title="Creator" note="“Great fit for the reel”" delay={120} tag={<FontAwesomeIcon icon={faCheck} className="text-green-500" />} />
        <MockRow person={c} title="Creator" note="“Ask about rates”" delay={240} />
      </Showcase>

      <Showcase
        title={d('home.fCampaignTitle', 'Post a campaign and let talent come to you')}
        body={d('home.fCampaignBody', 'Describe the job once. Verified creators apply with a pitch, and you pick the ones you want.')}
        points={[
          d('home.fCampaign1', 'Set a budget, deadline and number of slots'),
          d('home.fCampaign2', 'Review pitches in one list'),
          d('home.fCampaign3', 'Selecting someone starts the hire request'),
        ]}
      >
        <Reveal>
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold sm:text-base">Product launch reel</p>
              <span className={`${pill} bg-green-100 text-green-700`}>Open</span>
            </div>
            <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
              18 applications · 3 of 5 slots filled
            </p>
            <div className="mt-3">
              <Progress percent={60} />
            </div>
          </div>
        </Reveal>
        <MockRow
          person={a}
          title="Creator"
          note="“I'd love to cover this…”"
          delay={150}
          tag={<span className={`${pill} bg-green-100 text-green-700`}>Accepted</span>}
        />
      </Showcase>

      <Showcase
        flip
        title={d('home.fAgreementTitle', 'Sign it properly, pay by milestone')}
        body={d('home.fAgreementBody', 'Turn an accepted request into a written agreement. Both sides sign with a one-time code and the terms lock.')}
        points={[
          d('home.fAgreement1', 'Milestones with amounts and due dates'),
          d('home.fAgreement2', 'Terms locked with a fingerprint'),
          d('home.fAgreement3', 'Reviews after the work is done'),
        ]}
      >
        <MockRow title="1. Script approved" note="Delivered and approved" delay={0} tag={<FontAwesomeIcon icon={faCheck} className="text-green-500" />} />
        <MockRow
          title="2. Video delivered"
          note="Waiting for approval"
          delay={120}
          tag={
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
          }
        />
        <MockRow title="Signed by both sides" note="Terms locked" delay={240} tag={<FontAwesomeIcon icon={faFileSignature} className="text-gray-900" />} />
      </Showcase>
    </section>
  )
}

/* ---------- 3. How it works ---------- */

export function HowItWorks() {
  const { t } = useTranslation()
  const [ref, seen] = useInView<HTMLOListElement>()
  const steps = [
    { icon: faMagnifyingGlass, title: t('home.step1Title'), body: t('home.step1Body') },
    { icon: faChartLine, title: t('home.step2Title'), body: t('home.step2Body') },
    { icon: faHandshake, title: t('home.step3Title'), body: t('home.step3Body') },
  ]
  return (
    <section>
      <Title sub={t('home.howSubtitle')}>{t('home.howTitle')}</Title>
      <ol ref={ref} className="relative mt-10 grid gap-8 sm:mt-12 sm:gap-10 md:grid-cols-3">
        <span
          aria-hidden="true"
          style={{ transform: seen ? 'scaleX(1)' : 'scaleX(0)' }}
          className="absolute start-[17%] end-[17%] top-8 hidden h-0.5 origin-left bg-gray-900 transition-transform duration-[1400ms] ease-out md:block"
        />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 200}>
            <li className="relative text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-lg text-white shadow-lg sm:h-16 sm:w-16 sm:text-xl">
                <FontAwesomeIcon icon={s.icon} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold sm:mt-5 sm:text-xl">
                {s.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-xs text-gray-600 sm:text-sm">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}

/* ---------- 4. Open campaigns (live from the API) ---------- */

export function OpenCampaigns() {
  const { t, i18n } = useTranslation()
  const d = useD()
  const { data } = useQuery(campaignsQuery(new URLSearchParams({ limit: '6' })))
  const items = data?.items ?? []
  if (items.length === 0) return null
  return (
    <section>
      <Reveal className="flex items-end justify-between gap-3">
        <h2 className="font-display text-xl font-bold sm:text-2xl md:text-3xl">
          {d('home.openCampaigns', 'Open campaigns right now')}
        </h2>
        <Link
          to="/campaigns"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 sm:text-sm"
        >
          {t('home.seeAll')}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
        </Link>
      </Reveal>
      <div className="-mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:gap-4">
        {items.map((c, i) => (
          <Reveal key={c._id} delay={i * 80} className="snap-start">
            <Link
              to={`/campaigns/${c._id}`}
              className="group flex h-full w-64 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:w-72 sm:rounded-3xl sm:p-5"
            >
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="truncate">{c.business?.name}</span>
                {c.business?.verified && (
                  <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 text-sky-500" />
                )}
              </p>
              <h3 className="mt-2 font-display text-base font-bold leading-snug sm:text-lg">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-xs text-gray-600 sm:text-sm">{c.brief}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] sm:pt-4 sm:text-xs">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-900 sm:px-3">
                  {c.budget ? money(c.budget.amount, c.budget.currency) : d('home.budgetOpen', 'Budget open')}
                </span>
                {c.deadline && (
                  <span className="shrink-0 text-gray-500">
                    {new Date(c.deadline).toLocaleDateString(i18n.language, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- 5. Benefits ---------- */

export function Benefits() {
  const d = useD()
  const items = [
    { icon: faShieldHalved, t: d('home.b1', 'Verified identities'), b: d('home.b1b', 'A one-time code sent to an official account proves who is behind a profile.') },
    { icon: faChartLine, t: d('home.b2', 'Real reach'), b: d('home.b2b', 'Followers and engagement per platform, with the source shown.') },
    { icon: faFileSignature, t: d('home.b3', 'Agreements that hold'), b: d('home.b3b', 'Milestones, code-based signing and locked terms.') },
    { icon: faUserTie, t: d('home.b4', 'Managers, with consent'), b: d('home.b4b', 'Agents act for talent only when the talent allows it.') },
    { icon: faLanguage, t: d('home.b5', 'English, Urdu, Arabic'), b: d('home.b5b', 'The whole site, including right-to-left layouts.') },
    { icon: faUsers, t: d('home.b6', 'Moderated community'), b: d('home.b6b', 'Reports, reviews and an audit log keep the platform honest.') },
  ]
  return (
    <section>
      <Title>{d('home.whyTitle', 'Why teams choose us')}</Title>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={(i % 3) * 100}>
            <div className="group h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:rounded-3xl sm:p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white transition duration-300 group-hover:rotate-6 group-hover:scale-110 sm:h-12 sm:w-12">
                <FontAwesomeIcon icon={it.icon} />
              </span>
              <h3 className="mt-4 font-display text-base font-bold sm:text-lg">{it.t}</h3>
              <p className="mt-1.5 text-xs text-gray-600 sm:text-sm">{it.b}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ---------- 6. FAQ ---------- */

export function Faq() {
  const d = useD()
  const [open, setOpen] = useState(0)
  const rows = [
    [d('home.q1', 'How is a profile verified?'), d('home.a1', 'The person claims the profile, we send a 6-digit code to one of their official accounts, and an admin approves it once they enter the code.')],
    [d('home.q2', 'Is it free to join?'), d('home.a2', 'Creating an account and a profile is free.')],
    [d('home.q3', 'How does hiring work?'), d('home.a3', 'A verified business sends a hire request. When the talent accepts, both sides see each other\'s contact details and can draft an agreement.')],
    [d('home.q4', 'Can a manager work for a creator?'), d('home.a4', 'Yes. A verified manager can request to represent a creator, and the creator chooses what the manager may do.')],
    [d('home.q5', 'My profile is already listed. What now?'), d('home.a5', 'Find it, press Claim and follow the steps. Once approved it shows the verified badge and you control the details.')],
  ]
  return (
    <section className="mx-auto max-w-3xl">
      <Title>{d('home.faqTitle', 'Questions, answered')}</Title>
      <div className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
        {rows.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 p-4 text-start text-sm font-semibold sm:gap-4 sm:p-5 sm:text-base"
              >
                <span className="min-w-0">{q}</span>
                <FontAwesomeIcon
                  icon={faPlus}
                  className={`shrink-0 text-gray-900 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ${
                  open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <p className="overflow-hidden px-4 text-xs text-gray-600 sm:px-5 sm:text-sm">
                  <span className="block pb-4 sm:pb-5">{a}</span>
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}