import { useEffect, useState, type ReactNode } from 'react'
import { taxName } from '../utils/taxonomy'
import { createPortal } from 'react-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBriefcase,
  faCheck,
  faClapperboard,
  faVideo,
  faBuilding,
  faCar,
  faChartLine,
  faEarthAsia,
  faFilm,
  faFutbol,
  faGamepad,
  faGavel,
  faGraduationCap,
  faHandHoldingHeart,
  faHashtag,
  faIndustry,
  faLandmark,
  faLayerGroup,
  faMagnifyingGlass,
  faMicrochip,
  faMusic,
  faNewspaper,
  faPalette,
  faPersonPraying,
  faPlane,
  faSeedling,
  faShirt,
  faStethoscope,
  faUtensils,
  faFlask,
  faXmark,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { peopleQuery } from '../api/queries'
import { COUNTRY_OPTIONS } from '../constants/people'
import { useTaxonomy } from '../hooks/useTaxonomy'
import { countryName } from '../utils/format'

// Upar wale card ki tasveer (Unsplash)
const HEADER_IMAGE =
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80'

// Industry ke slug mein ye lafz ho to ye icon (database ke naam badlein to bhi chale)
const INDUSTRY_ICONS: [string, IconDefinition][] = [
  ['tech', faMicrochip],
  ['media', faNewspaper],
  ['entertain', faFilm],
  ['film', faClapperboard],
  ['content', faVideo],
  ['music', faMusic],
  ['sport', faFutbol],
  ['health', faStethoscope],
  ['business', faChartLine],
  ['education', faGraduationCap],
  ['fashion', faShirt],
  ['food', faUtensils],
  ['travel', faPlane],
  ['gaming', faGamepad],
  ['politic', faLandmark],
  ['non-profit', faHandHoldingHeart],
  ['religion', faPersonPraying],
  ['real-estate', faBuilding],
  ['automotive', faCar],
  ['agri', faSeedling],
  ['art', faPalette],
  ['science', faFlask],
  ['law', faGavel],
]
const iconFor = (slug: string) =>
  INDUSTRY_ICONS.find(([key]) => slug.includes(key))?.[1] ?? faLayerGroup

// "PK" -> 🇵🇰
const flag = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))

interface Item {
  key: string
  label: string
}

const SECTIONS = ['industries', 'professions', 'topics', 'countries'] as const
type SectionId = (typeof SECTIONS)[number]

// Har section ka URL param (Explore wale hi naam)
const KINDS = ['industry', 'profession', 'topic', 'country'] as const
type Kind = (typeof KINDS)[number]
type Match = 'all' | 'any'

// Har hissa ek safed panel: upar icon, naam, chhoti tafseel aur ginti
function Panel({
  id,
  icon,
  title,
  description,
  count,
  selectedCount,
  children,
}: {
  id: SectionId
  icon: IconDefinition
  title: string
  description: string
  count: number
  selectedCount: number
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/70"
    >
      <header className="flex items-start gap-4 border-b border-gray-100 px-5 py-5 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm text-white">
          <FontAwesomeIcon icon={icon} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
            selectedCount ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {selectedCount ? t('browse.selectedCount', { count: selectedCount }) : count}
        </span>
      </header>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  )
}

// Chhota checkbox jaisa nishan
function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] transition ${
        on ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-transparent'
      }`}
    >
      <FontAwesomeIcon icon={faCheck} />
    </span>
  )
}

// Ek qatar: icon/jhanda, naam, aur chuna hua ho to nishan
function RowToggle({
  item,
  lead,
  on,
  onToggle,
}: {
  item: Item
  lead: ReactNode
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition ${
        on ? 'bg-gray-100 ring-1 ring-gray-900' : 'hover:bg-gray-50'
      }`}
    >
      {lead}
      <span className="min-w-0 flex-1 text-sm font-medium text-gray-800 group-hover:text-gray-950">
        {item.label}
      </span>
      <Check on={on} />
    </button>
  )
}

const skeleton = (count: number, className: string) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className={`animate-pulse rounded-2xl bg-gray-200/70 ${className}`} />
  ))

// /browse -> industry, profession, topic aur mulk chun kar ek saath dhoondo.
// Chuni hui cheezen URL mein (?industry=a,b&...) taake Back pe wapas wahi milen
function Browse() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState('')
  const { data: professions, isLoading: loadingProfessions } = useTaxonomy('professions')
  const { data: industries, isLoading: loadingIndustries } = useTaxonomy('industries')
  const { data: topics, isLoading: loadingTopics } = useTaxonomy('topics')

  // Chunao component ki apni state mein (tez clicks pe koi click zaya na ho).
  // Shuru URL se, aur har badlaav URL mein bhi, taake Back pe wapas wahi mile
  const [selected, setSelected] = useState<Record<Kind, string[]>>(
    () =>
      Object.fromEntries(
        KINDS.map((kind) => [kind, (searchParams.get(kind) ?? '').split(',').filter(Boolean)]),
      ) as Record<Kind, string[]>,
  )
  const [match, setMatch] = useState<Match>(() =>
    searchParams.get('match') === 'any' ? 'any' : 'all',
  )
  const isOn = (kind: Kind, key: string) => selected[kind].includes(key)
  const totalSelected = KINDS.reduce((sum, kind) => sum + selected[kind].length, 0)

  function toggle(kind: Kind, key: string) {
    setSelected((prev) => ({
      ...prev,
      [kind]: prev[kind].includes(key) ? prev[kind].filter((k) => k !== key) : [...prev[kind], key],
    }))
  }
  function clearAll() {
    setSelected({ industry: [], profession: [], topic: [], country: [] })
    setMatch('all')
  }

  // Chuni hui cheezon ke params: yahi Explore pe jaate hain (aur yahi is page ka URL)
  const resultParams = new URLSearchParams()
  KINDS.forEach((kind) => selected[kind].length && resultParams.set(kind, selected[kind].join(',')))
  if (totalSelected > 1) resultParams.set('match', match)
  const resultQuery = resultParams.toString()
  useEffect(() => {
    // History mein har click alag na bane
    setSearchParams(new URLSearchParams(resultQuery), { replace: true })
  }, [resultQuery, setSearchParams])

  // Kitne log match karte hain (button pe dikhane ke liye)
  const countParams = new URLSearchParams(resultParams)
  countParams.set('limit', '1')
  const { data: preview, isFetching: counting } = useQuery({
    ...peopleQuery(countParams),
    enabled: totalSelected > 0,
    placeholderData: keepPreviousData,
  })
  const matches = totalSelected > 0 ? preview?.meta.total : undefined

  // Upar wale box mein likha lafz har list pe lagao
  const term = filter.trim().toLowerCase()
  const visible = (label: string) => !term || label.toLowerCase().includes(term)
  const toItems = (items: { _id: string; name: string; slug: string }[] = []) =>
    items.map((item) => ({ key: item.slug, label: taxName(item) })).filter((i) => visible(i.label))

  const industryItems = toItems(industries)
  const professionItems = toItems(professions)
  const topicItems = toItems(topics)
  const countryItems: Item[] = COUNTRY_OPTIONS.map((code) => ({
    key: code,
    label: countryName(code),
  })).filter((item) => visible(item.label))

  const counts: Record<SectionId, number> = {
    industries: industryItems.length,
    professions: professionItems.length,
    topics: topicItems.length,
    countries: countryItems.length,
  }
  const nothingFound = !!term && Object.values(counts).every((count) => count === 0)

  // Neeche patti mein chuni cheezon ke naam
  const nameOf = (kind: Kind, key: string) => {
    const lists = { industry: industries, profession: professions, topic: topics }
    if (kind === 'country') return countryName(key)
    return lists[kind]?.find((item) => item.slug === key)?.name ?? key
  }
  const selectedNames = KINDS.flatMap((kind) => selected[kind].map((key) => nameOf(kind, key)))

  return (
    <div className={`space-y-12 ${totalSelected ? 'pb-40 sm:pb-28' : ''}`}>
      {/* Upar: tasveer, heading aur categories mein dhoondne ka box */}
      <section className="keep-dark relative isolate overflow-hidden rounded-3xl bg-gray-900 px-5 py-12 text-white sm:px-10 md:py-16">
        <img
          src={HEADER_IMAGE}
          alt=""
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/20 rtl:bg-gradient-to-l" />
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">
            {t('browse.eyebrow')}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl">
            {t('browse.title')}
          </h1>
          <p className="mt-3 text-sm text-white/75 md:text-base">{t('browse.subtitle')}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/90">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] text-gray-900">
              <FontAwesomeIcon icon={faCheck} />
            </span>
            {t('browse.pickHint')}
          </p>

          <label className="relative mt-6 block max-w-lg">
            <span className="sr-only">{t('browse.filterLabel')}</span>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('browse.filterPlaceholder')}
              className="w-full rounded-xl bg-white py-3.5 pe-10 ps-11 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/60"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter('')}
                aria-label={t('browse.clearFilter')}
                className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            )}
          </label>
        </div>

        {/* Section pe chhalang: tabs ki tarah */}
        <nav aria-label={t('browse.jumpTo')} className="mt-8 flex flex-wrap gap-2">
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white hover:text-gray-900"
            >
              {t(`browse.${id}`)}
              <span className="text-xs opacity-70">{counts[id]}</span>
            </a>
          ))}
        </nav>
      </section>

      {nothingFound && (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
          {t('browse.nothingFound', { term: filter.trim() })}
        </p>
      )}

      <div className="space-y-6">
        {/* Industries: icon ke saath qataarein */}
        {(loadingIndustries || industryItems.length > 0) && (
          <Panel
            id="industries"
            icon={faIndustry}
            title={t('browse.industries')}
            description={t('browse.industriesDesc')}
            count={counts.industries}
            selectedCount={selected.industry.length}
          >
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {loadingIndustries
                ? skeleton(9, 'm-1 h-12')
                : industryItems.map((item) => {
                    const on = isOn('industry', item.key)
                    return (
                      <RowToggle
                        key={item.key}
                        item={item}
                        on={on}
                        onToggle={() => toggle('industry', item.key)}
                        lead={
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm transition ${
                              on
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                            }`}
                          >
                            <FontAwesomeIcon icon={iconFor(item.key)} />
                          </span>
                        }
                      />
                    )
                  })}
            </div>
          </Panel>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Professions: directory jaisi columns */}
          {(loadingProfessions || professionItems.length > 0) && (
            <div className="lg:col-span-3">
              <Panel
                id="professions"
                icon={faBriefcase}
                title={t('browse.professions')}
                description={t('browse.professionsDesc')}
                count={counts.professions}
                selectedCount={selected.profession.length}
              >
                <ul className="columns-1 gap-x-4 px-1 py-1 min-[420px]:columns-2 sm:columns-3">
                  {loadingProfessions
                    ? skeleton(12, 'mb-2 h-6 break-inside-avoid')
                    : professionItems.map((item) => {
                        const on = isOn('profession', item.key)
                        return (
                          <li key={item.key} className="break-inside-avoid">
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => toggle('profession', item.key)}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start text-sm transition ${
                                on
                                  ? 'font-medium text-gray-950'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                              }`}
                            >
                              <Check on={on} />
                              {item.label}
                            </button>
                          </li>
                        )
                      })}
                </ul>
              </Panel>
            </div>
          )}

          {/* Mulk: jhande ke saath */}
          {countryItems.length > 0 && (
            <div className="lg:col-span-2">
              <Panel
                id="countries"
                icon={faEarthAsia}
                title={t('browse.countries')}
                description={t('browse.countriesDesc')}
                count={counts.countries}
                selectedCount={selected.country.length}
              >
                <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                  {countryItems.map((item) => (
                    <RowToggle
                      key={item.key}
                      item={item}
                      on={isOn('country', item.key)}
                      onToggle={() => toggle('country', item.key)}
                      lead={
                        <span className="text-xl leading-none" aria-hidden="true">
                          {flag(item.key)}
                        </span>
                      }
                    />
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>

        {/* Topics: halke tag */}
        {(loadingTopics || topicItems.length > 0) && (
          <Panel
            id="topics"
            icon={faHashtag}
            title={t('browse.topics')}
            description={t('browse.topicsDesc')}
            count={counts.topics}
            selectedCount={selected.topic.length}
          >
            <div className="flex flex-wrap gap-2 px-2 py-1">
              {loadingTopics
                ? skeleton(12, 'h-8 w-24 rounded-full')
                : topicItems.map((item) => {
                    const on = isOn('topic', item.key)
                    return (
                      <button
                        key={item.key}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle('topic', item.key)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
                          on
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-900'
                        }`}
                      >
                        {on ? (
                          <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                        ) : (
                          <span className="text-gray-400">#</span>
                        )}
                        {item.label}
                      </button>
                    )
                  })}
            </div>
          </Panel>
        )}
      </div>

      {/* Aakhir mein: seedha Explore */}
      <section className="keep-dark flex flex-col items-start justify-between gap-4 rounded-3xl bg-gray-900 p-6 text-white sm:flex-row sm:items-center md:p-8">
        <div>
          <h2 className="text-xl font-semibold">{t('browse.ctaTitle')}</h2>
          <p className="mt-1 text-sm text-white/70">{t('browse.ctaBody')}</p>
        </div>
        <Link
          to="/search"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          {t('browse.ctaButton')}
          <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
        </Link>
      </section>

      {/* Neeche chipki patti: kitna chuna, kaise milana hai, aur natije */}
      {/* Portal: page ki animation (transform) ke andar "fixed" screen se nahi chipakta */}
      {totalSelected > 0 &&
        createPortal(
          <div className="fixed inset-x-0 bottom-4 z-30 px-4">
            <div
              role="region"
              aria-label={t('browse.selectionBar')}
              className="keep-dark mx-auto flex max-w-4xl flex-wrap items-center gap-3 rounded-2xl bg-gray-900 p-3 text-white shadow-2xl ring-1 ring-white/10 sm:flex-nowrap sm:p-4"
            >
              <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                <p className="text-sm font-semibold">
                  {t('browse.selectedTotal', { count: totalSelected })}
                </p>
                <p className="truncate text-xs text-white/60" title={selectedNames.join(', ')}>
                  {selectedNames.join(' · ')}
                </p>
                {matches === 0 && match === 'all' && totalSelected > 1 && (
                  <p className="mt-0.5 text-xs font-medium text-amber-300">{t('browse.tryAny')}</p>
                )}
              </div>

              {totalSelected > 1 && (
                <div
                  className="inline-flex shrink-0 rounded-xl bg-white/10 p-1"
                  role="radiogroup"
                  aria-label={t('browse.matchLabel')}
                >
                  {(['all', 'any'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={match === value}
                      title={t(`browse.match.${value}Hint`)}
                      onClick={() => setMatch(value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        match === value
                          ? 'bg-white text-gray-900'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {t(`browse.match.${value}`)}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={clearAll}
                className="shrink-0 rounded-xl px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                {t('browse.clearSelection')}
              </button>
              <button
                type="button"
                disabled={matches === 0}
                onClick={() => navigate(`/search?${resultParams}`)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matches === undefined || (counting && preview === undefined)
                  ? t('browse.showResults')
                  : matches === 0
                    ? t('browse.noMatches')
                    : t('browse.showPeople', { count: matches })}
                {matches !== 0 && (
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
                )}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default Browse
