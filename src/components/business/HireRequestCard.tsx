import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuilding,
  faCalendarDays,
  faCircleCheck,
  faEnvelope,
  faGlobe,
  faLocationDot,
  faMoneyBillWave,
  faPhone,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import Avatar from '../Avatar'
import Stars from '../agreements/Stars'
import StatusPill from '../admin-panel/StatusPill'
import type { HireRequest } from '../../types/business'
import { formatDate } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'

// Talent ko: kis business ne bheji (verified, kya karti hai, kahan hai, website)
function BusinessInfo({
  business,
  rating,
}: {
  business: NonNullable<HireRequest['businessProfile']>
  rating?: HireRequest['businessRating']
}) {
  const { t } = useTranslation()
  const location = [business.city, countryName(business.country)].filter(Boolean).join(', ')
  return (
    <div className="mt-1 space-y-1">
      {/* Business name + verified badge: mobile pe center, sm+ left */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-700 sm:justify-start">
        <span className="font-medium">{t('hire.from', { business: business.companyName })}</span>
        {business.status === 'approved' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-star-soft px-2 py-0.5 text-[10px] font-medium text-star-ink sm:text-xs">
            <FontAwesomeIcon icon={faCircleCheck} />
            {t('hire.verifiedBusiness')}
          </span>
        )}
        {rating ? (
          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
            <Stars value={rating.average} size="text-xs" />
            <span className="hidden sm:inline">
              {t('agreements.ratingSummary', { average: rating.average, count: rating.count })}
            </span>
            <span className="sm:hidden">
              {rating.average} ({rating.count})
            </span>
          </span>
        ) : (
          <span className="text-xs text-gray-500">{t('agreements.noRatings')}</span>
        )}
      </div>

      {/* Industry, location, website: mobile pe center stack, sm+ left row */}
      <div className="flex flex-col items-center gap-1 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-start sm:justify-start sm:gap-x-4 sm:gap-y-1">
        {business.industry && (
          <span>
            <FontAwesomeIcon icon={faBuilding} className="me-1.5" />
            {business.industry}
            {business.companySize &&
              ` · ${t('business.fields.employees', { size: business.companySize })}`}
          </span>
        )}
        {location && (
          <span>
            <FontAwesomeIcon icon={faLocationDot} className="me-1.5" />
            {location}
          </span>
        )}
        {business.websiteUrl && (
          <a
            href={business.websiteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faGlobe} className="me-1.5" />
            {t('profile.website')}
          </a>
        )}
      </div>

      {business.description && (
        <p className="line-clamp-2 text-center text-xs text-gray-500 sm:text-start">
          {business.description}
        </p>
      )}
    </div>
  )
}

// Accept ke baad: ek doosre ka raabta aur aage kya karna hai
function ContactPanel({
  contact,
  who,
}: {
  contact: NonNullable<HireRequest['contact']>
  who: 'talent' | 'business'
}) {
  const { t } = useTranslation()
  return (
    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm">
      <p className="text-center font-medium text-green-800 sm:text-start">
        {who === 'business' ? t('hire.nextStepsTalent') : t('hire.nextStepsBusiness')}
      </p>
      <ul className="mt-2 space-y-1 text-gray-800">
        <li className="flex items-start justify-center gap-2 sm:justify-start">
          <FontAwesomeIcon icon={faUser} className="mt-1 w-3.5 shrink-0 text-gray-500" />
          <span className="break-words">{contact.name}</span>
        </li>
        <li className="flex items-start justify-center gap-2 sm:justify-start">
          <FontAwesomeIcon icon={faEnvelope} className="mt-1 w-3.5 shrink-0 text-gray-500" />
          <a href={`mailto:${contact.email}`} className="break-all underline">
            {contact.email}
          </a>
        </li>
        {contact.phone && (
          <li className="flex items-start justify-center gap-2 sm:justify-start">
            <FontAwesomeIcon icon={faPhone} className="mt-1 w-3.5 shrink-0 text-gray-500" />
            <a
              href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
              dir="ltr"
              className="underline"
            >
              {contact.phone}
            </a>
          </li>
        )}
      </ul>
    </div>
  )
}

// Ek hire request: business aur talent dono ke dashboard pe.
// "who" = card pe kis ka naam (business ko talent dikhta hai, talent ko business)
function HireRequestCard({
  hire,
  who,
  showTalent = false,
  children,
}: {
  hire: HireRequest
  who: 'talent' | 'business'
  // Manager ke inbox mein: kis talent ke liye aayi
  showTalent?: boolean
  children?: ReactNode
}) {
  const { t, i18n } = useTranslation()
  const budget =
    hire.budget &&
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: hire.budget.currency,
      maximumFractionDigits: 0,
    }).format(hire.budget.amount)

  return (
    <li
      className={`rounded-2xl border bg-white p-3 text-center sm:p-4 sm:text-start md:p-5 ${
        who === 'business' && hire.status === 'pending' ? 'border-amber-300' : 'border-gray-200'
      }`}
    >
      {/* Mobile: column + centered. Desktop (sm+): row + top-aligned (jaise pehle tha) */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-start">
        {who === 'talent' ? (
          <Avatar name={hire.person?.name ?? '?'} photoUrl={hire.person?.photoUrl} />
        ) : null}

        <div className="min-w-0 w-full sm:flex-1">
          {/* Title + status pill: mobile pe center, sm+ left */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h3 className="text-sm font-semibold sm:text-base">{hire.title}</h3>
            <StatusPill status={hire.status} label={t(`hireStatus.${hire.status}`)} />
          </div>

          {who === 'talent' ? (
            <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
              {hire.person ? (
                <Link to={`/people/${hire.person.slug}`} className="underline">
                  {hire.person.name}
                </Link>
              ) : (
                t('claims.deletedProfile')
              )}
              {hire.serviceTitle && <> · {hire.serviceTitle}</>}
            </p>
          ) : (
            <>
              {showTalent && hire.person && (
                <p className="mt-0.5 text-xs font-medium text-violet-700 sm:text-sm">
                  {t('manager.forTalent', { name: hire.person.name })}
                </p>
              )}
              {hire.businessProfile ? (
                <BusinessInfo business={hire.businessProfile} rating={hire.businessRating} />
              ) : (
                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                  {t('hire.from', { business: '—' })}
                </p>
              )}
              {hire.serviceTitle && (
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  {t('hire.forService', { service: hire.serviceTitle })}
                </p>
              )}
            </>
          )}

          <p className="mt-2 whitespace-pre-line text-xs text-gray-700 sm:text-sm">
            {hire.message}
          </p>

          {/* Meta: mobile pe center, sm+ left wrap */}
          <div className="mt-3 flex flex-col items-center gap-1 text-[11px] text-gray-500 sm:flex-row sm:flex-wrap sm:items-start sm:justify-start sm:gap-x-4 sm:gap-y-1 sm:text-xs">
            {budget && (
              <span>
                <FontAwesomeIcon icon={faMoneyBillWave} className="me-1.5" />
                {budget}
              </span>
            )}
            {hire.startDate && (
              <span>
                <FontAwesomeIcon icon={faCalendarDays} className="me-1.5" />
                {t('hire.startsOn', { date: formatDate(hire.startDate) })}
              </span>
            )}
            <span>{t('hire.sentOn', { date: formatDate(hire.createdAt) })}</span>
            {hire.respondedAt && (
              <span>{t('hire.repliedOn', { date: formatDate(hire.respondedAt) })}</span>
            )}
          </div>

          {/* Talent ki jagah manager ne jawab diya */}
          {hire.respondedBy?.role === 'representative' && (
            <p className="mt-2 text-xs text-gray-500">
              {t('manager.answeredBy', { name: hire.respondedBy.name })}
            </p>
          )}

          {hire.responseNote && (
            <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700 sm:text-sm">
              {t('hire.responseNote', { note: hire.responseNote })}
            </p>
          )}

          {hire.status === 'accepted' && hire.contact && (
            <ContactPanel contact={hire.contact} who={who} />
          )}
        </div>
      </div>

      {/* Buttons: mobile pe center stack, sm+ right-aligned (jaise pehle) */}
      {children && (
        <div className="mt-3 flex flex-col-reverse items-center justify-center gap-2 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {children}
        </div>
      )}
    </li>
  )
}

export default HireRequestCard