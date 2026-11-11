import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract, faHandshake } from '@fortawesome/free-solid-svg-icons'
import StatusPill from '../admin-panel/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import type { ShortlistItem } from '../../types/shortlist'

// List mein har shakhs ke saath: hire ki halat (request / muahida), ya "Hire" ka button.
// Hire sirf business account aur sirf verified (claimed) talent ke liye
function HiringStatus({ item }: { item: ShortlistItem }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const person = item.person

  if (!item.available) {
    return <span className="text-xs text-gray-500">{t('shortlists.unavailable')}</span>
  }

  const hiring = item.hiring
  if (hiring?.agreementId && hiring.agreementStatus) {
    return (
      <Link
        to={`/agreements/${hiring.agreementId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium underline"
      >
        <FontAwesomeIcon icon={faFileContract} />
        {t('shortlists.agreementStatus', {
          status: t(`agreementStatus.${hiring.agreementStatus}`),
        })}
      </Link>
    )
  }
  if (hiring && hiring.hireStatus !== 'cancelled' && hiring.hireStatus !== 'declined') {
    return (
      <StatusPill
        status={hiring.hireStatus}
        label={
          hiring.hireStatus === 'pending' ? t('hire.requestSent') : t(`hireStatus.${hiring.hireStatus}`)
        }
      />
    )
  }

  if (user?.role !== 'business') return null
  if (!person?.verified || !person.claimed) {
    return <span className="text-xs text-gray-500">{t('shortlists.cantHireYet')}</span>
  }
  return (
    <div className="flex flex-col items-end gap-1">
      {hiring && (
        <span className="text-xs text-gray-500">
          {t('shortlists.lastRequest', { status: t(`hireStatus.${hiring.hireStatus}`) })}
        </span>
      )}
      {/* Hire ka form profile page pe hai (services aur budget wahin se) */}
      <Link
        to={`/people/${person.slug}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand hover:bg-brand-hover"
      >
        <FontAwesomeIcon icon={faHandshake} />
        {t('hire.button')}
      </Link>
    </div>
  )
}

export default HiringStatus
