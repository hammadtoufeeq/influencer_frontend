import { useTranslation } from 'react-i18next'
import { taxName } from '../../utils/taxonomy'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faCircleCheck,
  faLocationDot,
  faStar,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { personQuery } from '../../api/queries'
import { SHORTLIST_ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import type { PersonSummary } from '../../types/person'
import { countryName, formatCount } from '../../utils/format'
import { Photo } from '../home/HomeSections'
import SaveToShortlist from '../shortlists/SaveToShortlist'

// Portrait card: big photo, name and reach on top of a dark gradient
function TalentCard({ person }: { person: PersonSummary }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const location = [person.city, countryName(person.country)].filter(Boolean).join(', ')
  const isOpen = person.availability?.isOpen

  return (
    <div className="group relative">
      <Link
        to={`/people/${person.slug}`}
        // Profile pehle se cache mein la lo, taake click pe foran khule
        onMouseEnter={() => queryClient.prefetchQuery(personQuery(person.slug))}
        className="keep-dark relative block aspect-[4/5] overflow-hidden rounded-3xl bg-brand-plum text-white shadow-md transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl"
      >
        <Photo
          person={person}
          className="h-full w-full transition duration-700 group-hover:scale-105"
          fallbackClass="items-start pt-[24%] text-3xl text-white/80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {isOpen && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {t('search.openBadge', { defaultValue: 'Open to work' })}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="flex items-center gap-1.5 font-display text-base font-bold leading-tight">
            <span className="truncate">{person.name}</span>
            {person.verified && <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 text-sm text-sky-300" />}
          </p>
          {person.headline && <p className="mt-1 line-clamp-2 text-xs text-white/80">{person.headline}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70">
            {person.professions[0] && <span>{person.professions.map(taxName).join(' · ')}</span>}
            {location && (
              <span>
                <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                {location}
              </span>
            )}
            {person.totalFollowers > 0 && (
              <span>
                <FontAwesomeIcon icon={faUsers} className="me-1" />
                {formatCount(person.totalFollowers)}
              </span>
            )}
            {!!person.rating?.count && (
              <span>
                <FontAwesomeIcon icon={faStar} className="me-1 text-amber-300" />
                {person.rating.average.toFixed(1)}
              </span>
            )}
          </p>
          <span className="mt-2.5 inline-flex translate-y-3 items-center gap-2 text-xs font-semibold opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {t('search.viewProfile', { defaultValue: 'View profile' })}
            <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
          </span>
        </div>
      </Link>
      {user && SHORTLIST_ROLES.includes(user.role) && (
        <div className="absolute end-3 top-3 z-10">
          <SaveToShortlist personId={person._id} personName={person.name} />
        </div>
      )}
    </div>
  )
}

export default TalentCard