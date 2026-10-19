import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBriefcase,
  faBuilding,
  faBullhorn,
  faCalendarDays,
  faCircleCheck,
  faGlobe,
  faGraduationCap,
  faHandHoldingHeart,
  faLandmark,
  faLocationDot,
  faTag,
  faTicket,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import RatingBadge from '../agreements/RatingBadge'
import type { DirectoryBusiness, DirectoryManager } from '../../types/directory'
import { countryName, initials } from '../../utils/format'
import { hostOf } from './directoryUtils'

const ORG_ICONS: Record<string, IconDefinition> = {
  company: faBuilding,
  brand: faTag,
  marketing_agency: faBullhorn,
  ngo: faHandHoldingHeart,
  university: faGraduationCap,
  event_organizer: faTicket,
  government: faLandmark,
}

const locationOf = (entry: DirectoryBusiness | DirectoryManager) =>
  [entry.city, countryName(entry.country)].filter(Boolean).join(', ')

// Tasdeeq ki halat: Verified / In review / Not verified yet
function useStatus(entry: DirectoryBusiness | DirectoryManager) {
  const { t } = useTranslation()
  if (entry.verified) return { dot: 'bg-blue-500', label: t('site.verified') }
  if (entry.inReview) return { dot: 'bg-amber-500', label: t('directory.inReview') }
  return { dot: 'bg-gray-400', label: t('directory.notVerified') }
}

// Logo ya photo; na ho ya load na ho to initials
function Picture({
  src,
  name,
  className,
  fallbackClass = '',
}: {
  src?: string
  name: string
  className: string
  fallbackClass?: string
}) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`${className} object-cover`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`${className} keep-dark flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900 font-bold text-white ${fallbackClass}`}
    >
      {initials(name)}
    </span>
  )
}

// Business card: campaign card jaisa (safed, chips, neeche "View" ka teer)
export function BusinessCard({ business }: { business: DirectoryBusiness }) {
  const { t, i18n } = useTranslation()
  const status = useStatus(business)
  const location = locationOf(business)
  const joined = new Date(business.joinedAt).toLocaleDateString(i18n.language, {
    month: 'short',
    year: 'numeric',
  })
  const chip = 'inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1'

  return (
    <Link
      to={`/businesses/${business._id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-gray-300"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gray-900 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />

      <div className="flex min-w-0 items-center gap-3">
        <Picture
          src={business.logoUrl}
          name={business.name}
          className="h-12 w-12 shrink-0 rounded-2xl text-sm ring-1 ring-gray-200"
        />
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-display text-lg font-bold leading-snug text-gray-900">
            <span className="truncate">{business.name}</span>
            {business.verified && (
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="shrink-0 text-sm text-blue-600"
                title={t('site.verified')}
              />
            )}
          </h3>
          {(business.organizationType || business.industry) && (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
              <FontAwesomeIcon
                icon={ORG_ICONS[business.organizationType ?? ''] ?? faBuilding}
                className="shrink-0 text-[10px] text-gray-400"
              />
              <span className="truncate">
                {[
                  business.organizationType && t(`orgType.${business.organizationType}`),
                  business.industry,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </p>
          )}
        </div>
      </div>

      {business.description && (
        <p className="mt-4 line-clamp-3 text-sm text-gray-600">{business.description}</p>
      )}

      <div className="mt-auto pt-5">
        {business.rating?.count ? (
          <RatingBadge rating={business.rating} size="md" />
        ) : (
          <p className="text-sm text-gray-400">{t('agreements.noRatings')}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-gray-600">
          {!business.verified && (
            <span className={chip}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          )}
          {location && (
            <span className={chip}>
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
              {location}
            </span>
          )}
          {business.companySize && (
            <span className={chip}>
              <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
              {t('directory.employees', { size: business.companySize })}
            </span>
          )}
          {business.websiteUrl && (
            <span className={`${chip} max-w-full`}>
              <FontAwesomeIcon icon={faGlobe} className="text-gray-400" />
              <span className="truncate">{hostOf(business.websiteUrl)}</span>
            </span>
          )}
          <span className={chip}>
            <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400" />
            {t('directory.joined', { date: joined })}
          </span>
        </div>

        <span className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900">
          {t('directory.viewBusiness')}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs transition duration-300 group-hover:translate-x-1 group-hover:bg-gray-900 group-hover:text-white rtl:group-hover:-translate-x-1">
            <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
          </span>
        </span>
      </div>
    </Link>
  )
}

// Manager card: campaign card jaisa (safed, chips, bara number, neeche "View" ka teer)
export function ManagerCard({ manager }: { manager: DirectoryManager }) {
  const { t, i18n } = useTranslation()
  const status = useStatus(manager)
  const location = locationOf(manager)
  const joined = new Date(manager.joinedAt).toLocaleDateString(i18n.language, {
    month: 'short',
    year: 'numeric',
  })
  const chip = 'inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1'

  return (
    <Link
      to={`/managers/${manager._id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-gray-300"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gray-900 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />

      <div className="flex min-w-0 items-center gap-3">
        <Picture
          src={manager.photoUrl}
          name={manager.name}
          className="h-12 w-12 shrink-0 rounded-full text-sm ring-1 ring-gray-200"
        />
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-display text-lg font-bold leading-snug text-gray-900">
            <span className="truncate">{manager.name}</span>
            {manager.verified && (
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="shrink-0 text-sm text-blue-600"
                title={t('site.verified')}
              />
            )}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-gray-500">
            <FontAwesomeIcon icon={faBriefcase} className="shrink-0 text-[10px] text-gray-400" />
            <span className="truncate">{manager.agencyName || t('manager.independent')}</span>
          </p>
        </div>
      </div>

      {manager.bio && <p className="mt-4 line-clamp-3 text-sm text-gray-600">{manager.bio}</p>}

      <div className="mt-auto pt-5">
        <div className="flex items-end justify-between gap-3">
          <p className="font-display text-2xl font-extrabold text-gray-900">
            {manager.talents}
            <span className="ms-2 text-sm font-medium text-gray-500">
              {t('directory.talentsLabel', { count: manager.talents })}
            </span>
          </p>
          {manager.rating?.count ? (
            <RatingBadge rating={manager.rating} />
          ) : (
            <span className="text-xs text-gray-400">{t('agreements.noRatings')}</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-gray-600">
          {!manager.verified && (
            <span className={chip}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          )}
          {location && (
            <span className={chip}>
              <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
              {location}
            </span>
          )}
          {manager.websiteUrl && (
            <span className={`${chip} max-w-full`}>
              <FontAwesomeIcon icon={faGlobe} className="text-gray-400" />
              <span className="truncate">{hostOf(manager.websiteUrl)}</span>
            </span>
          )}
          <span className={chip}>
            <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400" />
            {t('directory.joined', { date: joined })}
          </span>
        </div>

        <span className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-gray-900">
          {t('directory.viewManager')}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs transition duration-300 group-hover:translate-x-1 group-hover:bg-gray-900 group-hover:text-white rtl:group-hover:-translate-x-1">
            <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
          </span>
        </span>
      </div>
    </Link>
  )
}
