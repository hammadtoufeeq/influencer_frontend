import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faCircleCheck,
  faHourglassHalf,
  faPen,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { myManagerProfileQuery } from '../../api/queries'
import { formatDate } from '../../utils/adminFormat'
import { countryName } from '../../utils/format'

const box = 'rounded-2xl border bg-white p-5 shadow-sm md:p-6'
const primary =
  'inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800'
const outline =
  'inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100'

// Manager dashboard: tasdeeq ki halat. Sirf verified manager talents ke saath jur sakta hai
function ManagerVerificationSection() {
  const { t } = useTranslation()
  const { data: manager, isLoading } = useQuery(myManagerProfileQuery)

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />

  if (!manager) {
    return (
      <section className={`${box} border-gray-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('manager.verification')}</p>
        <div className="mt-2 flex flex-wrap items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <FontAwesomeIcon icon={faUserTie} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{t('manager.getVerifiedTitle')}</h2>
            <p className="mt-1 text-sm text-gray-600">{t('manager.getVerifiedText')}</p>
          </div>
        </div>
        <Link to="/dashboard/manager" className={`${primary} mt-4`}>
          {t('manager.addDetails')}
          <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
        </Link>
      </section>
    )
  }

  const where = [manager.city, countryName(manager.country)].filter(Boolean).join(', ')
  const tone =
    manager.status === 'approved'
      ? 'border-green-200'
      : manager.status === 'rejected'
        ? 'border-red-200'
        : 'border-amber-200'

  return (
    <section className={`${box} ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {manager.status === 'approved' ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
              <FontAwesomeIcon icon={faCircleCheck} />
              {t('manager.verifiedManager')}
            </p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <FontAwesomeIcon icon={faHourglassHalf} />
              {manager.status === 'pending' ? t('manager.underReview') : t('manager.notVerified')}
            </p>
          )}
          {manager.agencyName && (
            <h2 className="mt-1 text-lg font-semibold">{manager.agencyName}</h2>
          )}
          <p className="text-sm text-gray-500">{where}</p>
        </div>
        <Link to="/dashboard/manager" className={outline}>
          <FontAwesomeIcon icon={faPen} className="text-xs" />
          {manager.status === 'rejected' ? t('business.fixAndResubmit') : t('business.edit')}
        </Link>
      </div>

      {manager.status === 'pending' && (
        <p className="mt-3 text-sm text-gray-600">
          {t('manager.pendingText', { date: formatDate(manager.submittedAt) })}
        </p>
      )}
      {manager.status === 'rejected' && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('manager.rejected', { reason: manager.rejectionReason ?? '' })}
        </p>
      )}
      {manager.status === 'approved' && (
        <>
          <p className="mt-3 text-sm text-gray-600">{t('manager.approvedText')}</p>
          <Link to="/search" className={`${primary} mt-4`}>
            {t('manager.findTalents')}
            <FontAwesomeIcon icon={faArrowRight} className="rtl:rotate-180" />
          </Link>
        </>
      )}
    </section>
  )
}

export default ManagerVerificationSection
