import { useCallback, useEffect, useRef, useState } from 'react'
import { taxName } from '../../utils/taxonomy'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faChartSimple,
  faChevronLeft,
  faChevronRight,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import Avatar from '../Avatar'
import VerifiedBadge from '../VerifiedBadge'
import type { PersonSummary } from '../../types/person'
import { formatCount } from '../../utils/format'

const CARD_WIDTH = 'w-[78%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]'

// Ek profile card: followers, engagement aur niche (pehla pesha)
function FeaturedCard({ person }: { person: PersonSummary }) {
  const { t } = useTranslation()
  const niche = person.professions[0] && taxName(person.professions[0])
  return (
    <Link
      to={`/people/${person.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
    >
      <div className="flex flex-col items-center text-center">
        <Avatar name={person.name} photoUrl={person.photoUrl} size="lg" />
        <p className="mt-3 line-clamp-1 font-semibold">{person.name}</p>
        <div className="mt-1 flex min-h-6 flex-wrap items-center justify-center gap-1.5">
          {person.verified && <VerifiedBadge />}
          {niche && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{niche}</span>
          )}
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 divide-x divide-gray-100 rounded-xl bg-gray-50 py-3 text-center rtl:divide-x-reverse">
        <div>
          <dt className="text-[11px] text-gray-500">
            <FontAwesomeIcon icon={faUsers} className="me-1" />
            {t('home.followers')}
          </dt>
          <dd className="mt-0.5 font-bold">{formatCount(person.totalFollowers)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-gray-500">
            <FontAwesomeIcon icon={faChartSimple} className="me-1" />
            {t('home.engagement')}
          </dt>
          <dd className="mt-0.5 font-bold">
            {typeof person.engagementRate === 'number' ? `${person.engagementRate}%` : '—'}
          </dd>
        </div>
      </dl>
      <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {t('home.viewProfile')}
        <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
      </span>
    </Link>
  )
}

// Home page: sab se zyada followers wale log, ek line mein. Ungli se swipe, ya tir ke buttons.
// Native scroll-snap: mobile pe swipe muft, aur Urdu/Arabic (RTL) mein ulta khud
function FeaturedCarousel({ people, isLoading }: { people?: PersonSummary[]; isLoading: boolean }) {
  const { t, i18n } = useTranslation()
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  // Shuru / aakhir pe ho to us taraf ka button band
  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    const offset = Math.abs(el.scrollLeft)
    setEdges({ start: offset < 4, end: offset + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, people])

  // "Agla" = parhne ki simt mein: LTR mein daayen, RTL mein baayen
  function move(direction: 1 | -1) {
    const el = track.current
    if (!el) return
    const rtl = i18n.dir() === 'rtl'
    el.scrollBy({ left: direction * (rtl ? -1 : 1) * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  const button =
    'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-900 disabled:pointer-events-none disabled:opacity-40'

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">{t('home.featuredTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('home.featuredSubtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/search?sort=followers" className="hidden text-sm text-gray-500 hover:text-gray-900 sm:inline">
            {t('home.seeAll')}
          </Link>
          <button type="button" aria-label={t('home.previous')} disabled={edges.start} onClick={() => move(-1)} className={button}>
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs rtl:rotate-180" />
          </button>
          <button type="button" aria-label={t('home.next')} disabled={edges.end} onClick={() => move(1)} className={button}>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs rtl:rotate-180" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        onScroll={update}
        aria-label={t('home.featuredTitle')}
        className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className={`${CARD_WIDTH} shrink-0`}>
                <div className="h-72 animate-pulse rounded-2xl bg-gray-200/70" />
              </li>
            ))
          : people?.map((person) => (
              <li key={person._id} className={`${CARD_WIDTH} shrink-0 snap-start`}>
                <FeaturedCard person={person} />
              </li>
            ))}
      </ul>
    </div>
  )
}

export default FeaturedCarousel
