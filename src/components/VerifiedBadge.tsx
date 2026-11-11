import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
function VerifiedBadge() {
  const { t } = useTranslation()
  return (
    <span
      title={t('site.verifiedTitle')}
      className="inline-flex items-center rounded-full bg-star-soft px-2 py-0.5 text-xs font-medium text-star-ink"
    >
      <FontAwesomeIcon icon={faCircleCheck} className="me-1" />
      {t('site.verified')}
    </span>
  )
}

export default VerifiedBadge
