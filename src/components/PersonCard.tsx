import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faUsers, faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { personQuery } from '../api/queries'
import type { PersonSummary } from '../types/person'
import { countryName, formatCount } from '../utils/format'
import Avatar from './Avatar'
import SaveToShortlist from './shortlists/SaveToShortlist'
import { SHORTLIST_ROLES } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import UnclaimedBadge from './UnclaimedBadge'
import VerifiedBadge from './VerifiedBadge'
import RatingBadge from './agreements/RatingBadge'

function PersonCard({ person }: { person: PersonSummary }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canSave = !!user && SHORTLIST_ROLES.includes(user.role)

  function prefetchProfile() {
    queryClient.prefetchQuery(personQuery(person.slug))
  }

  const location = [person.city, countryName(person.country)].filter(Boolean).join(', ')

  return (
    <div className="group relative">
      {/* Soft glow that appears on hover */}
      <div className="pointer-events-none absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-gray-900/10 via-transparent to-gray-900/5 opacity-0 blur-lg transition duration-500 group-hover:opacity-100" />

      <Link
        to={`/people/${person.slug}`}
        onMouseEnter={prefetchProfile}
        onFocus={prefetchProfile}
        onTouchStart={prefetchProfile}
        className={`relative flex h-full gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-500 will-change-transform group-hover:-translate-y-1.5 group-hover:border-gray-300 group-hover:shadow-xl ${
          canSave ? 'pe-14' : ''
        }`}
      >
        {/* Subtle gradient wash */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white via-white to-gray-50" />

        {/* Animated avatar with ring */}
        <div className="relative shrink-0">
          <span className="absolute -inset-1 rounded-full bg-gradient-to-br from-gray-900/15 to-transparent opacity-0 blur-md transition duration-500 group-hover:opacity-100" />
          <div className="relative transition duration-500 group-hover:scale-105">
            <Avatar name={person.name} photoUrl={person.photoUrl} />
          </div>
          {person.availability?.isOpen && (
            <span
              className="absolute -bottom-0.5 -end-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white"
              title={t('services.availableShort')}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400/70" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900 transition group-hover:text-gray-950">
              {person.name}
            </h3>
            {person.verified && <VerifiedBadge />}
            {person.claimedBy === null && <UnclaimedBadge />}
          </div>

          {person.headline && (
            <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{person.headline}</p>
          )}

          {person.rating && (
            <div className="mt-1 flex items-center gap-2">
              <RatingBadge rating={person.rating} />
            </div>
          )}

          {person.professions.length > 0 && (
            <p className="mt-2 text-xs font-medium text-gray-500">
              {person.professions.map((p) => p.name).join(' · ')}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {location && (
              <span className="inline-flex items-center">
                <FontAwesomeIcon icon={faLocationDot} className="me-1.5 text-gray-400" />
                {location}
              </span>
            )}
            {person.totalFollowers > 0 && (
              <span className="inline-flex items-center">
                <FontAwesomeIcon icon={faUsers} className="me-1.5 text-gray-400" />
                <span className="font-semibold text-gray-700">
                  {formatCount(person.totalFollowers)}
                </span>
                <span className="ms-1">{t('site.followersLabel', { defaultValue: 'followers' })}</span>
              </span>
            )}
          </div>

          {/* Hover "View profile" hint */}
          <span className="mt-3 inline-flex translate-y-2 items-center gap-1.5 text-xs font-semibold text-gray-900 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {t('home.viewProfile', { defaultValue: 'View profile' })}
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] rtl:rotate-180" />
          </span>
        </div>

        {/* Bottom gradient accent on hover */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gray-900 via-gray-700 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
      </Link>

      <div className="absolute end-3 top-3 z-10">
        <SaveToShortlist personId={person._id} personName={person.name} />
      </div>
    </div>
  )
}

export default PersonCard