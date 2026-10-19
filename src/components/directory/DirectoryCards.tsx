import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBuilding,
  faBullhorn,
  faCalendarDays,
  faCircleCheck,
  faGlobe,
  faGraduationCap,
  faHandHoldingHeart,
  faLandmark,
  faLocationDot,
  faStar,
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

// Manager card: talent card jaisa (bari photo, neeche andhera aur us pe naam)
export function ManagerCard({ manager }: { manager: DirectoryManager }) {
  const { t } = useTranslation()
  const status = useStatus(manager)
  const location = locationOf(manager)

  return (
    <Link
      to={`/managers/${manager._id}`}
      className="group keep-dark relative block aspect-[4/5] overflow-hidden rounded-3xl bg-brand-plum text-white shadow-md transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <Picture
        src={manager.photoUrl}
        name={manager.name}
        className="h-full w-full transition duration-700 group-hover:scale-105"
        fallbackClass="items-start pt-[22%] text-4xl tracking-wide text-white/80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow">
        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
        {status.label}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="flex items-center gap-1.5 font-display text-base font-bold leading-tight">
          <span className="truncate">{manager.name}</span>
          {manager.verified && (
            <FontAwesomeIcon icon={faCircleCheck} className="shrink-0 text-sm text-sky-300" />
          )}
        </p>
        <p className="mt-1 truncate text-xs text-white/80">
          {manager.agencyName || t('manager.independent')}
        </p>
        {manager.bio && (
          <p className="mt-1 line-clamp-2 text-[11px] text-white/65">{manager.bio}</p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70">
          {location && (
            <span>
              <FontAwesomeIcon icon={faLocationDot} className="me-1" />
              {location}
            </span>
          )}
          <span>
            <FontAwesomeIcon icon={faUsers} className="me-1" />
            {t('directory.talents', { count: manager.talents })}
          </span>
          {!!manager.rating?.count && (
            <span>
              <FontAwesomeIcon icon={faStar} className="me-1 text-amber-300" />
              {manager.rating.average.toFixed(1)} ({manager.rating.count})
            </span>
          )}
        </p>
        <span className="mt-2.5 inline-flex translate-y-3 items-center gap-2 text-xs font-semibold opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {t('search.viewProfile', { defaultValue: 'View profile' })}
          <FontAwesomeIcon icon={faArrowRight} className="text-xs rtl:rotate-180" />
        </span>
      </div>
    </Link>
  )
}
